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

    var sid = getSidByUid(uid, this.app);
    console.log(uid);

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
        console.log("Create ChannelName:"+currentChannelName);
        isCreatedRoom = true;
    }
    else if(channel && this.numberInChanel[currentChannelName] == 2){
        console.log("Create ChannelName:"+currentChannelName);
        currentChanel += 1;
        isCreatedRoom = true;
        currentChannelName = channelName + currentChanel;
        channel = this.app.get('channelService').createChannel(currentChannelName);
    }

    if(!this.numberInChanel[currentChannelName]) this.numberInChanel[currentChannelName] = 0;
    // Add to chanel

    channel.add(uid, sid);

    var opts = { type: typeGame };

    if( typeGame == 1){
        this.currentBlankChannel = currentChanel;
        if( isCreatedRoom && this.roomBlankList[currentChannelName] == null ){
            this.roomBlankList[currentChannelName] = new Room(opts);
            this.roomBlankList[currentChannelName].updateStage();
            this.roomBlankList[currentChannelName].createPlayer(this.numberInChanel[currentChannelName],typeWeapon,playerName);
        }

    }
    else {
        this.currentLightChannel = currentChanel;
        if( isCreatedRoom && this.roomLightList[currentChannelName] == null ){
            this.roomLightList[currentChannelName] = new Room(opts);
            this.roomLightList[currentChannelName].updateStage();
            this.roomLightList[currentChannelName].createPlayer(this.numberInChanel[currentChannelName],typeWeapon,playerName);
        }
    }

    this.numberInChanel[currentChannelName] += 1;
    //if( this.numberInChanel[currentChannelName] == 2 ){
    this.startGame(currentChannelName);
    //}
    this.typeRoom[currentChannelName] = typeGame;
    var rs = {};
    rs["code"] = Code.OK;
    rs["channelName"] = currentChannelName;
    if( typeGame == 1){
        rs["room"] = this.roomBlankList[currentChannelName];
    }
    else rs["room"] = this.roomLightList[currentChannelName];

    rs["noPlayer"] = this.numberInChanel[currentChannelName];
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
RoomService.prototype.kick = function(uid,numberPlayer,currentChannelName) {

    //var channelNames = this.channelMap[uid];

    var channel = this.app.get('channelService').getChannel(currentChannelName);
    if(channel) {
        var sid = getSidByUid(uid, this.app);
        channel.leave(uid, sid);
        console.log("Leave channel");
        var param = {
            route: 'onLeave',
            code: 'OK'
        };
        channel.pushMessage(param);
    }

    // Pull all chanel leave

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
RoomService.prototype.pushByChannel = function(channelName, msg, cb) {
    var channel = this.app.get('channelService').getChannel(channelName);
    if(!channel) {
        cb(new Error('channel ' + channelName + ' dose not exist'));
        return;
    }

    channel.pushMessage(Event.chat, msg, cb);
};

/**
 * Push message to the specified player
 *
 * @param  {String}   playerName player's role name
 * @param  {Object}   msg        message json object
 * @param  {Function} cb         callback
 */
RoomService.prototype.pushByPlayerName = function(playerName, msg, cb) {
    var record = this.nameMap[playerName];
    if(!record) {
        cb(null, Code.CHAT.FA_USER_NOT_ONLINE);
        return;
    }

    this.app.get('channelService').pushMessageByUids(Event.chat, msg, [{uid: record.uid, sid: record.sid}], cb);
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

RoomService.prototype.startBossAttack = function(currentRoomName,type){

    if( type == 1){
        return this.roomBlankList[currentRoomName].getBossInfoBeforeStartAttack();
    }
    else {
        return this.roomLightList[currentRoomName].getBossInfoBeforeStartAttack();
    }
};

RoomService.prototype.updateBossHP = function(currentRoomName, type, bossName, reduceHP){

    if( type == 1){
        return this.roomBlankList[currentRoomName].updateBossCurrentHP(bossName, reduceHP);
    }
    else {
        return this.roomLightList[currentRoomName].updateBossCurrentHP(bossName, reduceHP);
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
        console.log("Param:"+param);
        console.log(channel.getMembers().length);
        channel.pushMessage(param);
    }
};
