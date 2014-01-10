module.exports = function(app) {
	return new RoomRemote(app, app.get('roomService'));
};

var RoomRemote = function(app, roomService) {
	this.app = app;
	this.roomService = roomService;
};

/**
 *	Add player into channel
 */
RoomRemote.prototype.add = function(type,uid, playerName, typeWeapon, cb) {
    console.log("Roomservice:"+this.roomService);
	var rs = this.roomService.add(type,typeWeapon,uid, playerName);
	cb(null, rs);
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
RoomRemote.prototype.kick = function(uid, numberPlayer, currentChannelName, cb){
	this.roomService.kick(uid,numberPlayer,currentChannelName);
	cb();
};
