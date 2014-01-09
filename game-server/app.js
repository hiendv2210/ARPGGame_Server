var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
var sync = require('pomelo-sync-plugin');
var ChatService = require('./app/services/chatService');
var RoomService = require('./app/services/roomService');

/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name','chatofpomelo');

//console.log("Chay app.js");

// app configure
app.configure('production|development', function() {
	// route configures
	//app.route('chat', routeUtil.chat);
	// route configures
	app.route('area', routeUtil.area);
	app.route('connector', routeUtil.connector);
	app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');
	// filter configures
	app.filter(pomelo.timeout());
	
});

// Configure database
app.configure('production|development', 'area|auth|connector|master', function() {
	var dbclient = require('./app/dao/mysql/mysql').init(app);
	app.set('dbclient', dbclient);
	// app.load(pomelo.sync, {path:__dirname + '/app/dao/mapping', dbclient: dbclient});
    app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});
});

// Configure for auth server
app.configure('production|development', 'auth', function() {
	// load session congfigures
	app.set('session', require('./config/session.json'));
});

app.configure('production|development', 'chat', function() {
    app.set('chatService', new ChatService(app));
});


app.configure('production|development', 'room', function() {
    app.set('roomService', new RoomService(app));
});


//start
app.start();

process.on('uncaughtException', function(err) {
	console.error(' Caught exception: ' + err.stack);
});