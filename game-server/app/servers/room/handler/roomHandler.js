var Code = require('../../../../../shared/code');
var SCOPE = {PRI:'279106', AREA:'F7A900', ALL:'D41313', TEAM:'0897f7'};
var channelUtil = require('../../../util/channelUtil');
var logger = require('pomelo-logger').getLogger(__filename);
var utils = require('../../../util/utils');
var consts = require('../../../consts/consts');
var pomelo = require('pomelo');

module.exports = function(app) {
  return new ChannelHandler(app, app.get('roomService'));
};

var ChannelHandler = function(app, roomServices) {
  this.app = app;
  this.roomService = roomServices;
};

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
       console.log("ChannelName:"+ channelName);
       var channel = channelService.getChannel( channelName ,false);
       if(channel){
           channel.pushMessage(param);
       }
       else console.log("Not exits Channel");

       next(null,{code:Code.OK});

};

ChannelHandler.prototype.finishBossAttack = function(msg,session,next){
     var roomName = session.get("channelName");
     var type = session.get("typeGame");
     var bossInfo = this.roomService.startBossAttack(roomName,type);

     var param = {
         route : 'onStartBossAttack',
         msg: bossInfo
     };

    var channel = this.app.get('channelService').getChannel( roomName ,false);
    if(channel){
        channel.pushMessage(param);
    }
    next(null,{ code: Code.OK });
}


ChannelHandler.prototype.updateBossHP = function(msg, session, next){
    var reduceHP = msg.reduceHP;
    var bossName = msg.bossName;
    this.roomService.updateBossHP(session.get("channelName"),session.get("typeGame"),bossName,reduceHP);
    next(null,{code:Code.OK});
}






var startBossAttack = function( roomName,type ){
    return this.roomService.startBossAttack(roomName,type);
}


var getChannelName = function(msg){
  var scope = msg.scope;
  if (scope === SCOPE.AREA) {
    return channelUtil.getAreaChannelName(msg.areaId);
  }
  return channelUtil.getGlobalChannelName();
};
