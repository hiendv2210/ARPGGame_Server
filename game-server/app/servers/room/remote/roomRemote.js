module.exports = function(app) {
	return new RoomRemote(app, app.get('roomService'));
};

var RoomRemote = function(app, roomService) {
	this.app = app;
	this.roomService = roomService;
};
var dispatcher = require('../../../util/dispatcher');
/**
 *	Add player into channel
 */
RoomRemote.prototype.add = function(type,uid, playerName, typeWeapon, cb) {
	var rs = this.roomService.add(type,typeWeapon,uid, playerName);
    cb(null,rs);
};

/**
 * leave Channel
 * uid
 * channelName
 */

RoomRemote.prototype.leave =function(uid, channelName, cb){

	cb();
};

/**
 * kick out user
 *
 */
RoomRemote.prototype.kick = function(uid, numberPlayer, currentChannelName,playerName, cb){
	this.roomService.kick(uid,numberPlayer,currentChannelName,playerName);
	cb();
};


var getSidByUid = function(uid, app) {
    var connector = dispatcher.dispatch(uid, app.getServersByType('connector'));
    if(connector) {
        return connector.id;
    }
    return null;
};

