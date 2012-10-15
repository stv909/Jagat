var util = require('util');

util.puts('JAGAT server starting...');

var 
	connect = require('connect'),
	ace = require('connect-ace'),
	hat = require('hat'),
	// TODO: think about using nonconflict version of ACE ('/connect-ace/ace-build/src-min-noconflict') 
	//       in the future - 'ace.middleware('/ace', true, true)'.
	sharejs = require('share'),
	jagat = require('../'),
	options = require('./options') || {},
	server;
	
var server = connect(
	connect.logger(),
	// TODO: upgrade to connect 2.6.0+ and express for modern routing
	connect.favicon(),
	connect.static(__dirname + '/../frontend'),
	connect.router(function (app) {
		app.get('/text/?', function(req, res, next)
		{
			var docName;
			docName = hat();
			res.writeHead(303, {location: '/text.html#' + docName});
			res.write('');
			res.end();
		});

		app.get('/json/?', function(req, res, next)
		{
			var gameName;
			gameName = hat();
			res.writeHead(303, {location: '/json.html#' + gameName});
			res.write('');
			res.end();
		});

		app.get('/?', function(req, res, next)
		{
			res.writeHead(302, {location: '/index.html'});
			res.end();
		});
	})
);

server.use(ace.middleware('/ace', true));

util.puts("JAGAT server v" + jagat.version + " on ShareJS v" + sharejs.version);

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.server.attach(server, options);

var port = options.port || 8000;

server.listen(port);
util.puts('Server running at' + process.env.IP + ':' + port + '/');

process.title = 'jagat';
process.on(
	'uncaughtException', 
	function (err) {
		console.error('An error has occurred. Please file a ticket here: https://github.com/stv909/Jagat/issues');
		console.error('Version ' + jagat.version + ': ' + err.stack);
	}
);

util.puts('JAGAT is on duty.');
