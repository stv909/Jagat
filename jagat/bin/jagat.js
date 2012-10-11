#!/usr/bin/env node

var util = require('util');

util.puts('JAGAT server starting...');

var connect = require('connect'),
    jagat = require('../'),
	sharejs = require('share'),
	server;

server = connect(connect.logger());

options = require('./options') || {};

util.puts("JAGAT server v" + jagat.version + " on ShareJS v" + sharejs.version);

// Attach the sharejs REST and Socket.io interfaces to the server
sharejs.server.attach(server, options);

var port = options.port || 8000;

server.listen(port);
util.puts('Server running at' + process.env.IP + ':' + port + '/');

process.title = 'sharejs'
process.on('uncaughtException', function (err) {
  console.error('An error has occurred. Please file a ticket here: https://github.com/josephg/ShareJS/issues');
  console.error('Version ' + sharejs.version + ': ' + err.stack);
});

util.puts('JAGAT is on duty.');
