module.exports = function(app) {
	return new ChatRemote(app, app.get('roomService'));
};

var ChatRemote = function(app, chatService) {
	this.app = app;
	this.roomService = chatService;
};

/**
 *	Add player into channel
 */
ChatRemote.prototype.add = function(type,uid, playerName, typeWeapon, cb) {
    console.log("Roomservice:"+this.roomService);
	var rs = this.roomService.add(type,uid, playerName);
	cb(null, rs);
};

/**
 * leave Channel
 * uid
 * channelName
 */
ChatRemote.prototype.leave =function(uid, channelName, cb){
	this.roomService(uid, channelName);
	cb();
};

/**
 * kick out user
 *
 */
ChatRemote.prototype.kick = function(uid, cb){
	this.roomService.kick(uid);
	cb();
};
