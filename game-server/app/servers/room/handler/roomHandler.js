

module.exports = function(app) {
  return new ChannelHandler(app, app.get('roomService'));
};

var ChannelHandler = function(app, roomServices) {
  this.app = app;
  this.roomService = roomServices;
};

var Code = require('../../../../../shared/code');
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var consts = require('../../../consts/consts');
var pomelo = require('pomelo');
var dispatcher = require('../../../util/dispatcher');

ChannelHandler.prototype.send = function(msg, session, next) {

};

ChannelHandler.prototype.getBossInfo = function(msg, session, next) {

       var channelService = this.app.get('channelService');
       var channelName = session.get("channelName");

       var bossInfo = this.roomService.getBossInfo( channelName, session.get("typeGame") );

       var param = {
           route: 'onBossInfo',
           msg: bossInfo
       };

       var channel = channelService.getChannel( channelName ,false);
       if(channel){
           channel.pushMessage(param);
       }
       else console.log("Not exits Channel");


       next(null,{code:Code.OK});

};

ChannelHandler.prototype.finishBossAttack = function(msg,session,next){

    var playerInfo = {};

    playerInfo.kougeki = msg.kougeki;
    playerInfo.current_hp = msg.current_hp;
    playerInfo.current_gauge = msg.current_gauge;
    playerInfo.level = msg.level;
    playerInfo.attribute = msg.attribute;
    playerInfo.isLock = msg.isLock;
    playerInfo.lockCount = msg.lockCount;
    playerInfo.isPoison = msg.isPoison;
    playerInfo.poisonCount = msg.poisonCount;

    if( typeof playerInfo.kougeki == 'undefined' || typeof playerInfo.current_hp == 'undefined' || typeof playerInfo.current_gauge == 'undefined' ||
                typeof playerInfo.level == 'undefined' || typeof playerInfo.attribute == 'undefined' || typeof playerInfo.isLock == 'undefined'  ||
                typeof playerInfo.lockCount == 'undefined' || typeof playerInfo.isPoison == 'undefined' || typeof playerInfo.poisonCount == 'undefined' ){
        next(null,{ code: Code.FAIL });
    }
    else {
        var roomName = session.get("channelName");
        var type = session.get("typeGame");
        var noPlayer = session.get("numberPlayer");

        var playerInfo = this.roomService.finishBossAttack(roomName, type, noPlayer, playerInfo);

        if(playerInfo.isStart){
            var receivePlayer = this.roomService.getReceiveDropPlayer( type,roomName);
            var param = {
                route : 'onStartPlayerAttack',
                msg: {player:playerInfo.player,receivePlayer:receivePlayer}
            };
            console.log("Send onStartPlayerAttack");
            var channel = this.app.get('channelService').getChannel( roomName ,false);
            if(channel){
                channel.pushMessage(param);
            }
        }
        else{
            var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
            if( rs != null ){
                var param = {};
                param.route = "onFinishAttackBossFriend";
                param.msg = msg;
                param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];
                console.log("Send onFinishAttackBossFriend");
                this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
            }


        }
        console.log("finishBossAttack:"+noPlayer);
        next(null,{ code: Code.OK });

    }

}


ChannelHandler.prototype.updateBossHP = function(msg, session, next){

    console.log("updateBossHP");

    var reduceHP = msg.reduceHP;
    var bossName = msg.bossName;
    this.roomService.updateBossHP(session.get("channelName"),session.get("typeGame"),bossName,reduceHP);
    next(null,{code:Code.OK});
}


ChannelHandler.prototype.finishPlayerAttack = function(msg,session,next ){


    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    var bossInfo = this.roomService.startBossAttack(roomName,type,noPlayer);

    var returnVL = {};
    returnVL.code = Code.OK;
    returnVL.isEndStage = bossInfo.isFinish;
    console.log(bossInfo);
    if( !returnVL.isEndStage ){
        if( bossInfo.isStart){
            console.log("Push onStartBossAttack");
            var param = {
                route : 'onStartBossAttack',
                msg: bossInfo.boss
            };
            var channel = this.app.get('channelService').getChannel( roomName ,false);
            if(channel){
                channel.pushMessage(param);
            }
        }
        else{
            var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
            if( rs != null ){
                var param = {};
                param.route = "onFinishAttackFriend";
                param.msg = msg;
                /*
                 * param.msg = msg;
                 * */
                param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];
                console.log("Push onFinishAttackFriend");
                console.log(param.uids);
                this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
            }

        }

    }
    else{
        if(bossInfo.stage > 3){
            var param = { };
            param.route = 'onFinishGame';
            param.msg = 'true';
            var channel = this.app.get('channelService').getChannel( roomName ,false);
            if(channel){
                channel.pushMessage(param);
            }
        }
        else {
            var myInfo = this.roomService.getMyInfo(type,noPlayer,roomName);
            var param = { };
            param.route = 'onFinishStage';
            param.msg = 'onFinishStage';
            param.uids = [{uid:myInfo.uid,sid:getSidByUid(myInfo.name,this.app)}];
            this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
        }
    }
    // Send message

    console.log("finishPlayerAttack"+noPlayer);
    next(null,{code:Code.OK,isEndStage:returnVL.isEndStage});
   // next(null,{ code: Code.OK});
}

ChannelHandler.prototype.playerAttack = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    var code = Code.OK;
    if( rs != null ){

        var param = {};
        param.route = "onPlayerAttack";
        param.msg = msg;
        /*
        * param.msg = msg;
        * */
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }


    next(null,{ code: code });
}

ChannelHandler.prototype.playerSpecialAttack = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    var code = Code.OK;
    if( rs != null ){
        var param = {};
        param.route = "onPlayerSpecialAttack";
        param.msg = msg;
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];
        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }


    next(null,{ code: code });
}

ChannelHandler.prototype.reduceBossHP = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var bossName = msg.bossName;
    var reduceHP = msg.reduceHP;
    var isCritical = msg.isCritical;

    var friendInfo = this.roomService.getFriendInfo(roomName,type,noPlayer);
    if( friendInfo != null ){
        var param = {};
        param.route = "onReduceBossHP";
        param.msg = {bossName:msg.bossName,reduceHP:msg.reduceHP,isCritical:msg.isCritical};
        param.uids = [{uid:friendInfo.uid,sid:getSidByUid(friendInfo.name,this.app)}];
        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    var rs = this.roomService.reduceBossHP(roomName,type,noPlayer,bossName,reduceHP);

    var param = {
        route: 'onUpdateTargetPlayer',
        msg: {player:rs.targetName,boss:rs.boss}
    };

    var channel = this.app.get('channelService').getChannel( roomName ,false);
    if(channel){

        channel.pushMessage(param);
    }

    next(null,{ code: Code.OK });
}


/*ChannelHandler.prototype.useItem = function( msg,session,next ){
    console.log("Use Item");
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var typeItem = msg.type;
    var targetName = msg.targetName;
    console.log(msg);
    this.roomService.useItem(typeItem,targetName,noPlayer,type,roomName);
    //itemType,playerTarget,noPlayer,type,currentRoomName

    console.log("use item");


    // Send To Client update Player Info
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    if( rs != null ){
        var param = {};
        param.route = "onUseItem";
        param.msg = msg;
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{ code: Code.OK });
}
*/


ChannelHandler.prototype.lockPlayer = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    var isStartBoss = this.roomService.lockPlayer(noPlayer,type,roomName);

    // Send To Client update Player Info
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    if( rs != null ){
        var param = {};
        param.route = "onLockPlayer";
        param.msg = msg;
        /*
         * param.msg = msg;
         * */
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    // Check all player lock
    if(isStartBoss){
        var bossInfo = this.roomService.startBossAttack(roomName,type,noPlayer);
        if( !bossInfo.isEndStage ){
            if( bossInfo.isStart){
                var param = {
                    route : 'onStartBossAttack',
                    msg: bossInfo.boss
                };

                var channel = this.app.get('channelService').getChannel( roomName ,false);
                if(channel){
                    channel.pushMessage(param);
                }
            }

        }
    }

    next(null,{ code: Code.OK });
}

ChannelHandler.prototype.unlockPlayer = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    this.roomService.unlockPlayer(noPlayer,type,roomName);

    // Send To Client update Player Info
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    var code = Code.OK;
    if( rs != null ){
        var param = {};
        param.route = "onUnlockPlayer";
        param.msg = msg;
        /*
         * param.msg = msg;
         * */
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{ code: code });
}

ChannelHandler.prototype.poisonPlayer = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    this.roomService.poisonPlayer(noPlayer,type,roomName);

    // Send To Client update Player Info
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    var code = Code.OK;
    if( rs != null ){
        var param = {};
        param.route = "onPoisonPlayer";
        param.msg = msg;
        /*
         * param.msg = msg;
         * */
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{ code: code });
}

ChannelHandler.prototype.unpoisonPlayer = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    this.roomService.unPoisonPlayer(noPlayer,type,roomName);

    // Send To Client update Player Info
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    var code = Code.OK;
    if( rs != null ){
        var param = {};
        param.route = "onUnpoisonPlayer";
        param.msg = msg;
        /*
         * param.msg = msg;
         * */
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{ code: code });
}

ChannelHandler.prototype.nextStage = function( msg,session,next ){

    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    console.log("NextStage");
    this.roomService.updateStagePlayer(noPlayer,type,roomName,true);

    var rs = this.roomService.checkNewStage(noPlayer,type,roomName);
    console.log("rs:"+rs);
    if(rs){
        var roomInfo = this.roomService.updateNewStage(noPlayer,type,roomName);
        var param = {};
        param.route = "onUpdateStage";
        param.msg = roomInfo;
        //Check send start new stage
        var channel = this.app.get('channelService').getChannel( roomName ,false);
        if(channel){
            channel.pushMessage(param);
        }
    }

    next(null,{Code: Code.OK});

}

ChannelHandler.prototype.createDropItem = function( msg,session,next ){

    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);

    if( rs != null ){
        var param = {};
        param.route = "onCreateDropItem";
        param.msg = msg;
        /*
         * param.msg = msg;
         * */
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{Code: Code.OK});

}

ChannelHandler.prototype.useItem = function( msg,session,next ){

    var roomName = session.get("channelName");
    var typeGame = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");

    var type = msg.type;
    var id = msg.id;
    this.roomService.useItemPlayer(typeGame,noPlayer,roomName,id);
    var rs = this.roomService.getFriendInfo(roomName,typeGame,noPlayer);

    if( rs != null ){
        var param = {};
        param.route = "onUseItem";
        param.msg = msg;
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];

        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{Code: Code.OK});
}


ChannelHandler.prototype.updateUserInfo = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    var current_hp = msg.current_hp;
    var kougeki = msg.kougeki;
    var current_gauge = msg.current_gauge;

    //{id : vl1, hp : vl2, current_hp: vl3, kougeki : vl4, gauge : vl5, current_gauge : vl6 }
    this.roomService.updatePlayerInfoByNoPlayer(type,noPlayer,roomName,current_hp, kougeki,current_gauge);
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    if( rs != null ){
        var param = {};
        param.route = "onUpdateFriend";
        param.msg = msg;
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];
        console.log("onUpdateFriend");
        console.log(param);
        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }

    next(null,{Code: Code.OK});

}


ChannelHandler.prototype.updateDieStatus = function( msg,session,next ){

    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var rs = this.roomService.updateDieStatus(type,noPlayer,roomName);
    console.log("updateDieStatus");
    console.log(rs);
    if(rs.isFinishGame){
        var param = {};
        param.route = "onFinishGame";
        param.msg = "false";
        //Check send start new stage
        var channel = this.app.get('channelService').getChannel( roomName ,false);
        if(channel){
            channel.pushMessage(param);
        }
    }
    else {
        if( rs.isStart){

            // Send start boss

            var param = {
                route : 'onStartBossAttack',
                msg: rs.bossInfo
            };

            var channel = this.app.get('channelService').getChannel( roomName ,false);




            if(channel){
                channel.pushMessage(param);
            }
        }
    }

    // Check start boss

    next(null,{code: Code.OK});
}


ChannelHandler.prototype.updateCountDownTimeRevive = function( msg,session,next ){

    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    this.roomService.updateCountDownTimeRevive(type,noPlayer,roomName);
    var rs = this.roomService.getFriendInfo(roomName,type,noPlayer);
    if( rs != null ){
        var param = {};
        param.route = "onCountDownRevive";
        param.msg = "onCountDownRevive";
        param.uids = [{uid:rs.uid,sid:getSidByUid(rs.name,this.app)}];
        console.log("onCountDownRevive");
        console.log(param);
        this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);
    }
    // Check start boss

    next(null,{code: Code.OK});
}


/*ChannelHandler.prototype.updateTargetName = function( msg,session,next ){
    var roomName = session.get("channelName");
    var type = session.get("typeGame");
    var noPlayer = session.get("numberPlayer");
    var rs = this.roomService.updatePlayerOfTarget(type,noPlayer,noPlayer);

    var myInfo = this.roomService.getMyInfo(type,noPlayer,roomName);
    var param = { };
    param.route = 'onFinishStage';
    param.msg = rs;

    param.uids = [{uid:myInfo.uid,sid:getSidByUid(myInfo.name,this.app)}];
    this.app.get('channelService').pushMessageByUids(param.route,param.msg,param.uids);




} */



var getSidByUid = function(uid, app) {
    var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
    if(connector) {
        return connector.id;
    }
    return null;
};




