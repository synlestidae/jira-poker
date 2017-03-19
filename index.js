'use strict';

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var readline = require('readline');
var session = require('./session');
var request = require('./api').request;
var game = require('./game');
var server = require('./server');

var ClientSession = session.ClientSession;
var ServerSession = session.Session;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function parseCommand(line) {
    var parts = line.split(/\s+/);
    var command = parts[0].toLowerCase();
    return {command: parts[0], param: parts[1]};
}

var activePlayers = {};
var game = new Game();

var session;
if (process.argv[2]) {
  var url = process.argv[2];
  var playerId = process.argv[3];
} else {
  game.playerJoin('server');
  var s = server.makeServer(game, activePlayers);
  rl.on('line', (line) => s.session.onReadline(line));
}
