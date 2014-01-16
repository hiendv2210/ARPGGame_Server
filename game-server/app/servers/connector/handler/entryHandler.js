var async = require('async');
var userDao = require('../../../dao/userDao');
var Code = require('../../../../../shared/code');
var secret = require('../../../../../shared/config/session').secret;
var Token = require('../../../../../shared/token');
var channelUtil = require('../../../util/channelUtil');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;
/**
 * Get token.
 *
 * @param  {Object}   username     request username
 * @param  {Object}   password 	   request password
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.getToken = function( msg,session,next ){
	
	var username = msg.username;
	var pwd = msg.pwd;
	if (!username || !pwd) {
    	next(null,{code: 500});
    	return;
  	}
  
   userDao.getUserByName(username, function(err, user) {
    	if (err || !user) {
      		console.log('username not exist!');
      		next(null,{code: 500});
      		return;
   	 	}
    	if (pwd !== user.password) {
      		// TODO code
      		// password is wrong
      		console.log('password incorrect!');
      		next(null,{code: 501});
      		return;
    	}



    	var tk = Token.create(user.id, Date.now(), secret);
    	next(null, { code: Code.OK, token: tk , uid: user.id});
    	
  });


}

handler.createUser = function( msg,session,next ){
    var username = msg.username;
    var pwd = msg.pwd;

    if (!username || !pwd) {
        next(null,{code: 500});
        return;
    }

    userDao.createUser(username,pwd, function(err, user) {
        if (err || !user) {
            console.log('Not create!');
            next(null,{code: 500});
            return;
        }
		console.log("Tao thanh cong");
        next(null, { code: Code.OK});

    });


}

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
 
handler.enter = function(msg, session, next) {

	var token = msg.token, self = this;
    var typeGame = msg.typeGame;
    var typeWeapon = msg.typeWeapon;
    var rid = msg.rid;
	if(!token) {
		next(new Error('invalid entry request: empty token'), {code: Code.FAIL});
		return;
	}
	
	var uid, players, player;
	
	async.waterfall([
		function(cb) {
			// auth token
			self.app.rpc.auth.authRemote.auth(session, token, cb);
            //self.app.rpc.auth.authRemote.auth(session, username, cb);
			
		}, function(code, user, cb) {
			if(code !== Code.OK) {
				next(null, {code: code});
				return;
			}

			if(!user) {
				next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
				return;
			}
			console.log("Userid:"+user.id);
			uid = user.id;
			userDao.getPlayersByUid(user.id, cb);
		}, function(res, cb) {
			players = res;
			self.app.get('sessionService').kick(uid, cb);

		}, function(cb) {

			session.bind(uid, cb);

		}, function(cb) {
			if(!players || players.length === 0) {
				next(null, {code: Code.OK});
				return;
			}
			player = players[0];
			session.set('playername', player.username);
			session.set('playerId', player.id);
            session.set('typeGame', typeGame);
			session.on('closed', onUserLeave.bind(null, self.app));
			session.pushAll(cb);
		}, function(cb) {
            console.log("RoomRemote");
            self.app.rpc.room.roomRemote.add( session,typeGame, player.id, player.username, typeWeapon , cb );


		},function(rs,cb){

            session.set('channelName', rs["channelName"]);
            session.push('channelName', function(err) {
                if(err) {
                    console.error('channelName: %j', err.stack);
                }
            });
            session.set('numberPlayer', rs["noPlayer"]);
            session.push('numberPlayer', function(err) {
                if(err) {
                    console.error('numberPlayer: %j', err.stack);
                }
            });
            next(null,{code:rs["code"], body: rs["room"] , noPlayer : rs["noPlayer"]});

        }
	], function(err) {
		if(err) {
			next(err, {code: Code.FAIL});
			return;
		}

    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
	if(!session || !session.uid) {
		return;
	}

    console.log("Remove:"+session.get("numberPlayer"));
	//app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
    app.rpc.room.roomRemote.kick(session,session.uid, session.get("numberPlayer"),session.get("channelName"),session.get("playername"),null);
};