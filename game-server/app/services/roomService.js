/**
 * Created with JetBrains WebStorm.
 * User: dangvanhien
 * Date: 1/9/14
 * Time: 10:13 AM
 * To change this template use File | Settings | File Templates.
 */

var Code = require('../../../shared/code');
var utils = require('../util/utils');
var dispatcher = require('../util/dispatcher');
var Event = require('../consts/consts').Event;
var channelUtil = require('../util/channelUtil');
var Room = require('../model/room/room');

var RoomService = function(app) {
    this.currentLightChannel = 0;
    this.currentBlankChannel = 0;
    this.app = app;
    this.roomBlankList = {};
    this.roomLightList = {};
    this.typeRoom = {};
    this.numberInChanel = {};

};

module.exports = RoomService;

/**
 * Add player into the channel
 *
 * @param {String} uid         user id
 * @param {String} playerName  player's role name
 * @param {String} channelName channel name
 * @return {Number} see code.js
 */
RoomService.prototype.add = function(typeGame,typeWeapon,uid, playerName) {

    var isCreatedRoom = false;

    var sid = getSidByUid(playerName, this.app);
    if(!sid) {
        return Code.CHAT.FA_UNKNOWN_CONNECTOR;
    }
    var currentChanel = 0;
    var channelName = "";
    if( typeGame == 1){
        var currentChanel = this.currentBlankChannel;
         channelName = channelUtil.getBlankChannel();
    }
    else {
        var currentChanel = this.currentLightChannel;
        channelName = channelUtil.getLightChannel();

    }

    var currentChannelName = channelName + currentChanel;
    var channel = this.app.get('channelService').getChannel(currentChannelName, false);

    if(!channel) {
        channel = this.app.get('channelService').createChannel(currentChannelName);
        isCreatedRoom = true;
    }
    else if(channel && this.numberInChanel[currentChannelName] == 2){
        currentChanel += 1;
        isCreatedRoom = true;
        currentChannelName = channelName + currentChanel;
        channel = this.app.get('channelService').createChannel(currentChannelName);
    }

    if(!this.numberInChanel[currentChannelName]) this.numberInChanel[currentChannelName] = 0;
    // Add to chanel



    var opts = { type: typeGame };

    if( typeGame == 1){
        this.currentBlankChannel = currentChanel;
        if( isCreatedRoom && this.roomBlankList[currentChannelName] == null ){
            this.roomBlankList[currentChannelName] = new Room(opts);
            this.roomBlankList[currentChannelName].updateStage();

        }
        this.roomBlankList[currentChannelName].createPlayer(this.numberInChanel[currentChannelName],typeWeapon,playerName,uid);

    }
    else {
        this.currentLightChannel = currentChanel;
        if( isCreatedRoom && this.roomLightList[currentChannelName] == null ){
            this.roomLightList[currentChannelName] = new Room(opts);
            this.roomLightList[currentChannelName].updateStage();

        }
        this.roomLightList[currentChannelName].createPlayer(this.numberInChanel[currentChannelName],typeWeapon,playerName,uid);
    }

    this.numberInChanel[currentChannelName] += 1;
    if( this.numberInChanel[currentChannelName] == 2 ){
        this.startGame(currentChannelName);
        if( typeGame == 1){
            this.roomBlankList[currentChannelName].updateStatusRoom(true);
        }
        else this.roomLightList[currentChannelName].updateStatusRoom(true);
    }
    this.typeRoom[currentChannelName] = typeGame;

    channel.add(uid, sid);

    var param = {

    }
    param.route =  'onUpdatePlayer';

    var rs = {};
    rs["code"] = Code.OK;
    rs["channelName"] = currentChannelName;
    if( typeGame == 1){
        rs["room"] = this.roomBlankList[currentChannelName];
        param.msg = this.roomBlankList[currentChannelName].getPlayerInfo();
    }
    else{
        rs["room"] = this.roomLightList[currentChannelName];
        param.msg = this.roomLightList[currentChannelName].getPlayerInfo();
    }

    rs["noPlayer"] = this.numberInChanel[currentChannelName];




    // Update player
    this.pushByChannel(currentChannelName,param);


    return rs;
};

/**
 * User leaves the channel
 *
 * @param  {String} uid         user id
 * @param  {String} channelName channel name
 */
RoomService.prototype.leave = function(uid, channelName) {
    var record = this.uidMap[uid];
    var channel = this.app.get('channelService').getChannel(channelName, true);

    if(channel && record) {
        channel.leave(uid, record.sid);
    }

    removeRecord(this, uid, channelName);
};

/**
 * Kick user from chat service.
 * This operation would remove the user from all channels and
 * clear all the records of the user.
 *
 * @param  {String} uid user id
 */
RoomService.prototype.kick = function(uid,numberPlayer,currentChannelName,playerName) {

    //var channelNames = this.channelMap[uid];

    var channel = this.app.get('channelService').getChannel(currentChannelName);
    if(channel) {
        var sid = getSidByUid(playerName, this.app);
        channel.leave(uid, sid);
        // Leave user
        var param = {
            route: 'onLeave',
            id: numberPlayer - 1
        };
        console.log(param);
        channel.pushMessage(param);
    }

    // Pull all channel leave

    var type = this.typeRoom[currentChannelName];

    delete this.typeRoom[currentChannelName];

    if( type == 1){
         // Remove
        this.roomBlankList[currentChannelName].removePlayer(numberPlayer);
    }
    else {
        this.roomLightList[currentChannelName].removePlayer(numberPlayer);
    }

    if(this.numberInChanel[currentChannelName]) this.numberInChanel[currentChannelName] = 2;

};

/**
 * Push message by the specified channel
 *
 * @param  {String}   channelName channel name
 * @param  {Object}   msg         message json object
 * @param  {Function} cb          callback function
 */
RoomService.prototype.pushByChannel = function(channelName, msg) {
    var channel = this.app.get('channelService').getChannel(channelName);
    if(!channel) {
        cb(new Error('channel ' + channelName + ' dose not exist'));
        return;
    }
    channel.pushMessage(msg);
};


RoomService.prototype.getPlayerNameTarget = function( currentRoomName, type ){
    var room = null;
    if( type == 1){
        return this.roomBlankList[currentRoomName].getPlayerNameTarget();
    }
    else {
        return this.roomLightList[currentRoomName].getPlayerNameTarget();
    }

};



RoomService.prototype.getBossInfo = function(currentRoomName,type){

    if( type == 1){
        return this.roomBlankList[currentRoomName].getRoomOfBoosInfo();
    }
    else {
        return this.roomLightList[currentRoomName].getRoomOfBoosInfo();
    }
};

RoomService.prototype.startBossAttack = function(currentRoomName,type,noPlayer){

    var returnVL = {};
    var isStart = false;
    var bossInfo = [];
    var stage = 0;

    if( type == 1){
        this.roomBlankList[currentRoomName].updateAttackAblePlayer(noPlayer - 1,false);
        isStart =  this.roomBlankList[currentRoomName].checkStartBossAttack();
        isFinish = this.roomBlankList[currentRoomName].checkEndStage();
        if( isStart){
            bossInfo = this.roomBlankList[currentRoomName].getBossInfoBeforeStartAttack();

        }

        stage = this.roomBlankList[currentRoomName].getStage();
    }
    else {
        this.roomLightList[currentRoomName].updateAttackAblePlayer(noPlayer - 1,false);
        isStart =  this.roomLightList[currentRoomName].checkStartBossAttack();
        isFinish = this.roomLightList[currentRoomName].checkEndStage();
        if( isStart){
            bossInfo = this.roomLightList[currentRoomName].getBossInfoBeforeStartAttack();

        }
        stage = this.roomLightList[currentRoomName].getStage();
    }



    returnVL.isStart = isStart;
    returnVL.boss = bossInfo;
    returnVL.isFinish = isFinish;
    returnVL.stage = stage;

    return returnVL;

};

RoomService.prototype.updateBossHP = function(currentRoomName, type, bossName, reduceHP){

    if( type == 1){
        return this.roomBlankList[currentRoomName].updateBossCurrentHP(bossName, reduceHP);
    }
    else {
        return this.roomLightList[currentRoomName].updateBossCurrentHP(bossName, reduceHP);
    }
}


RoomService.prototype.finishBossAttack = function(currentRoomName, type, noPlayer, playerInfo){

    var isStart = false;

    var plInfo = [];
    var receivePlayer = "";

    var isFinishGame = false;

    if( type == 1){

        this.roomBlankList[currentRoomName].updatePlayerInfo(noPlayer - 1, playerInfo);
        this.roomBlankList[currentRoomName].updateAttackAblePlayer(noPlayer - 1,true);
        isStart = this.roomBlankList[currentRoomName].checkStartPlayerAttack();

        if( isStart ){
            plInfo = this.roomBlankList[currentRoomName].getPlayerInfoBeforeAttack();
            receivePlayer = this.roomBlankList[currentRoomName].getPlayerNameTarget();
        }

    }
    else {
        this.roomLightList[currentRoomName].updatePlayerInfo(noPlayer - 1, playerInfo);
        this.roomLightList[currentRoomName].updateAttackAblePlayer(noPlayer - 1,true);
        isStart = this.roomLightList[currentRoomName].checkStartPlayerAttack();

        if( isStart ) {
            plInfo = this.roomLightList[currentRoomName].getPlayerInfoBeforeAttack();
            receivePlayer = this.roomLightList[currentRoomName].getPlayerNameTarget();
        }
    }

    var msg = {};

    msg.isStart = isStart;
    msg.player = plInfo;
    msg.receivePlayer = receivePlayer;

    return msg;
}


RoomService.prototype.getFriendInfo = function(currentRoomName, type, noPlayer){

    if( type == 1){
        return this.roomBlankList[currentRoomName].getFriendInfo(noPlayer);
    }
    else {
        return this.roomLightList[currentRoomName].getFriendInfo(noPlayer);
    }

}

RoomService.prototype.reduceBossHP = function(currentRoomName, type, noPlayer,bossName,reduceHP){

    if( type == 1){
        return this.roomBlankList[currentRoomName].reduceBossHP(noPlayer,bossName,reduceHP);
    }
    else {
        return this.roomLightList[currentRoomName].reduceBossHP(noPlayer,bossName,reduceHP);
    }

}



/**
 * Cehck whether the user has already in the channel
 */
var checkDuplicate = function(service, uid, channelName) {
    return !!service.channelMap[uid] && !!service.channelMap[uid][channelName];
};

/**
 * Add records for the specified user
 */
var addRecord = function(service, uid, name, sid, channelName) {
    var record = {uid: uid, name: name, sid: sid};
    service.uidMap[uid] = record;
    var item = service.channelMap[uid];
    if(!item) {
        item = service.channelMap[uid] = {};
    }
    item[channelName] = 1;
    this.numberInChanel[chanelName]
};

/**
 * Remove records for the specified user and channel pair
 */
var removeRecord = function(service, uid, channelName) {
    delete service.channelMap[uid][channelName];
    if(utils.size(service.channelMap[uid])) {
        return;
    }

    // if user not in any channel then clear his records
    clearRecords(service, uid);
};

/**
 * Clear all records of the user
 */
var clearRecords = function(service, uid) {
    delete service.channelMap[uid];

    var record = service.uidMap[uid];
    if(!record) {
        return;
    }

    delete service.uidMap[uid];
    delete service.nameMap[record.name];
};

/**
 * Get the connector server id assosiated with the uid
 */
var getSidByUid = function(uid, app) {
    var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
    if(connector) {
        return connector.id;
    }
    return null;
};

/*
 *  Push all player start game
 * */

RoomService.prototype.startGame = function( channelName ){
    var channel = this.app.get('channelService').getChannel(channelName);

    if(channel) {

        var param = {
            route: 'onStart',
            code: 'OK'
        };
        channel.pushMessage(param);
    }
};



RoomService.prototype.useItem = function(itemType,playerTarget,noPlayer,type,currentRoomName){


    if( type == 1){
        return this.roomBlankList[currentRoomName].useItem(itemType,playerTarget,noPlayer);
    }
    else {
        return this.roomLightList[currentRoomName].useItem(itemType,playerTarget,noPlayer);
    }

}

RoomService.prototype.lockPlayer = function(noPlayer,type,currentRoomName){


    if( type == 1){
        return this.roomBlankList[currentRoomName].lockPlayer(noPlayer,true);
    }
    else {
        return this.roomLightList[currentRoomName].lockPlayer(noPlayer,true);
    }

}

RoomService.prototype.unlockPlayer = function(noPlayer,type,currentRoomName){


    if( type == 1){
        this.roomBlankList[currentRoomName].lockPlayer(noPlayer,false);
    }
    else {
        this.roomLightList[currentRoomName].lockPlayer(noPlayer,false);
    }

}

RoomService.prototype.poisonPlayer = function(noPlayer,type,currentRoomName){


    if( type == 1){
        this.roomBlankList[currentRoomName].poisonPlayer(noPlayer,false);
    }
    else {
        this.roomLightList[currentRoomName].poisonPlayer(noPlayer,false);
    }

}

RoomService.prototype.unPoisonPlayer = function(noPlayer,type,currentRoomName){


    if( type == 1){
        this.roomBlankList[currentRoomName].poisonPlayer(noPlayer,false);
    }
    else {
        this.roomLightList[currentRoomName].poisonPlayer(noPlayer,false);
    }

}

RoomService.prototype.updateStagePlayer = function(noPlayer,type,currentRoomName,isUpdate){

    if( type == 1){
        return this.roomBlankList[currentRoomName].updateStatePlayerByNoPlayer(isUpdate,noPlayer);
    }
    else {
        return this.roomLightList[currentRoomName].updateStatePlayerByNoPlayer(isUpdate,noPlayer);
    }

}

RoomService.prototype.checkNewStage = function(noPlayer,type,currentRoomName){

    if( type == 1){
        return this.roomBlankList[currentRoomName].checkUpdateStatePlayer();
    }
    else {
        return this.roomLightList[currentRoomName].checkUpdateStatePlayer();
    }

}

RoomService.prototype.updateNewStage = function(noPlayer,type,currentRoomName){

    if( type == 1){
        this.roomBlankList[currentRoomName].nextStage();
        this.roomBlankList[currentRoomName].updateStage();
        return this.roomBlankList[currentRoomName];
    }
    else {
        this.roomLightList[currentRoomName].nextStage();
        this.roomLightList[currentRoomName].updateStage();
        return this.roomLightList[currentRoomName];
    }

}

RoomService.prototype.getReceiveDropPlayer = function(type,currentRoomName){

    if( type == 1){

        return this.roomBlankList[currentRoomName].getPlayerNameTarget();
    }
    else {
        return this.roomLightList[currentRoomName].getPlayerNameTarget();
    }

}

RoomService.prototype.useItemPlayer = function(type,noPlayer,currentRoomName,id){
    //console.log(currentRoomName+"|"+type+"|"+noPlayer+"|"+id);
    if( type == 1){
        return this.roomBlankList[currentRoomName].useItem( type,noPlayer,id );
    }
    else {
        return this.roomLightList[currentRoomName].useItem( type,noPlayer,id );
    }

}

RoomService.prototype.getMyInfo = function(type,noPlayer,currentRoomName){

    if( type == 1){
        return this.roomBlankList[currentRoomName].getMyInfo( noPlayer );
    }
    else {
        return this.roomLightList[currentRoomName].getMyInfo( noPlayer );
    }

}

RoomService.prototype.updatePlayerInfoByNoPlayer = function(type,noPlayer,currentRoomName,current_hp, kougeki,current_gauge){

    if( type == 1){
        this.roomBlankList[currentRoomName].updatePlayerInfoByNoPlayer( current_hp, kougeki,current_gauge,noPlayer );
    }
    else {
        this.roomLightList[currentRoomName].updatePlayerInfoByNoPlayer( current_hp, kougeki,current_gauge,noPlayer );
    }

}

RoomService.prototype.updateDieStatus = function(type,noPlayer,currentRoomName){
    var returnVL = {};

    if( type == 1){
        this.roomBlankList[currentRoomName].updateDieStatus( noPlayer );
        //return this.roomBlankList[currentRoomName].checkIsFinishGame( noPlayer );
        returnVL.isFinishGame = this.roomBlankList[currentRoomName].checkIsFinishGame( noPlayer );
        returnVL.isStart = this.roomBlankList[currentRoomName].checkStartBossAttack();
        if(!returnVL.isFinishGame && returnVL.isStart){
            returnVL.bossInfo = this.roomBlankList[currentRoomName].getBossInfoBeforeStartAttack();
        }
    }
    else {
        this.roomLightList[currentRoomName].updateDieStatus( noPlayer );
        //return this.roomLightList[currentRoomName].checkIsFinishGame( noPlayer );
        returnVL.isFinishGame = this.roomLightList[currentRoomName].checkIsFinishGame( noPlayer );
        returnVL.isStart = this.roomLightList[currentRoomName].checkStartBossAttack();
        if(!returnVL.isFinishGame && returnVL.isStart){
           returnVL.bossInfo = this.roomLightList[currentRoomName].getBossInfoBeforeStartAttack();
        }
    }
    return returnVL;
}



RoomService.prototype.updateCountDownTimeRevive = function(type,noPlayer,currentRoomName){


    if( type == 1){
        this.roomBlankList[currentRoomName].updateCountDownTimeRevive( noPlayer );

    }
    else {
        this.roomLightList[currentRoomName].updateCountDownTimeRevive( noPlayer );
    }
}

RoomService.prototype.updatePlayerOfTarget = function(type,noPlayer,currentRoomName){

    if( type == 1){
        this.roomBlankList[currentRoomName].updatePlayerOfTarget( noPlayer );
    }
    else {
        this.roomLightList[currentRoomName].updatePlayerOfTarget( noPlayer );
    }

}




