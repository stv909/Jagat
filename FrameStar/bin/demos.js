var util = require('util');

util.puts('Frame-Star server starting...');

var
	connect = require('connect'),
	framestar = require('../'),
	server;

var server = connect(
	connect.logger(),
	// TODO: upgrade to connect 2.6.0+ and express for modern routing
	connect.favicon(),
	connect.static(__dirname + '/../frontend'),
	connect.router(function (app) {
		app.get('/demo01/?', function(req, res, next)
		{
			res.writeHead(303, {location: '/demo01.html'});
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

util.puts("Frame-Star server v" + framestar.version);

var port = process.env.PORT;

server.listen(port);
util.puts('Server running at ' + process.env.IP + ':' + port + '/');

process.title = 'Frame-Star';
process.on(
	'uncaughtException',
	function (err) {
		console.error('An error has occurred. Please file a ticket here: https://github.com/stv909/Jagat/issues');
		console.error('Version ' + framestar.version + ': ' + err.stack);
	}
);

util.puts('Frame-Star is on duty.');

