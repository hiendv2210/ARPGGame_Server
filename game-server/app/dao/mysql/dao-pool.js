var _poolModule = require('generic-pool');

/*
 * Create mysql connection pool.
 */
var createMysqlPool = function(app) {
	console.log("VLTN");
	var mysqlConfig = app.get('mysql');
	console.log("MySQL:"+mysqlConfig);
	return _poolModule.Pool({
		name: 'mysql',
		create: function(callback) {
			var mysql = require('mysql');
			var client = mysql.createConnection({
				host: mysqlConfig.host,
				user: mysqlConfig.user,
				password: mysqlConfig.password,
				database: mysqlConfig.database,
				port: 3306,
				socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock'
			});
 
			client.connect(function(err) {
  			// connected! (unless `err` is set)
			});
			console.log("client:"+mysqlConfig.host+"|"+mysqlConfig.user+"|"+mysqlConfig.password+"|"+mysqlConfig.database);
			//client.connect();
			callback(null, client);
			

        // parameter order: err, resource
        // new in 1.0.6
        	//callback(null, c);
		},
		destroy: function(client) {
			client.end();
		},
		max: 10,
		idleTimeoutMillis : 30000,
		log : false
	});
};

exports.createMysqlPool = createMysqlPool;
