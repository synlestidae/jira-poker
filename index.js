'use strict';

var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var fetch = require('node-fetch');
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

app.use(bodyParser.json());

function startServer() {
 app.listen(3000, function() {
  console.log('Started server');
 });
}

class Game {
  constructor() {
    this.players = {};
    this.currentIssue = null;
  }

  resetGame() {
    for (var p in this.players) {
      this.players[p] = null;
    } 
    this.currentIssue = null;
  }

  newGame(currentIssue) {
    this.currentIssue = currentIssue;
  }

  vote(playerId, points) {
    this.players[playerId] = points;
  }

  playerJoin(playerId) {
    if (this.players.hasOwnProperty(playerId)) {
      return false;
    }
    this.players.hasOwnProperty[playerId] = playerId;
  } 

  playerLeave(playerId) {
    return delete this.players[playerId];
  }

  allVoted() {
    this.players.reduce();
  }

  getResults() {
    var votes = [];
    for (var v in this.players) {
      votes.push(this.players[v]);
    }
    return votes;
  }
}

function parseCommand(line) {
    var parts = line.split(/\s+/);
    var command = parts[0].toLowerCase();
    return {command: parts[0], param: parts[1]};
}

class ClientSession {
  constructor(sessionId, url) {
    this.sessionId = sessionId;
    this.currentIssue = null;
  }

  onReadline(line) {
    if (!line) {
      return;
    }
    var command = parseCommand(line);
    if (command.command == 'vote') {
      var req = request('post', this.url + '/game/vote', {
        sessionId: this.sessionId,
        issue: this.currentIssue,
        vote: command.param
      });
      req.then(() => console.log('Voted ', command.param || null));
      return req;
    }
    return null;
  }
}

class ServerSession {
  constructor(url, playerId) {
    this.url = url;
    this.playerId = playerId;
  }

  onReadLine(line) {
    if (!line) {
      return;
    }
    var command = parseCommand(line);
    if (command.command === 'issue') {
      game.resetGame();
      game.currentIssue = command.param;
      console.log('Game reset. Current issue is ', command.param);
    } else if (command.command === 'vote') {
      game.vote(this.playerId, command.param >= 0? command.param : null); 
    } else if (command.command === 'kick') {
      game.playerLeave(command.param);
      delete activePlayers[command.param];
    } else {
      console.log('Invalid syntax: ', line.substring(0, 80));
    }
  }
  onGameUpdate(issue, votes) {
  }
}

function request(method, url, body) {
  return fetch(url, {
      method: method, 
      headers: {
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
      }, 
      body: JSON.stringify(body)
  }).then(resp => resp.json());
}

var activePlayers = {};
var game = new Game();

app.post('/session', function (req, resp) {
  var playerId = req.body.playerId;
  var sessionId = Math.random().toString().replace('.', '') + new Date().getTime();
  if (activePlayers.hasOwnProperty(playerId)) {
    resp.send({errorMsg: 'Player with this ID already exists'});
    return;
  }
  activePlayers[playerId] = sessionId;
  resp.send({
    playerId: playerId,
    sessionId: sessionId 
  });
  game.playerJoin(playerId);
});

app.get('/game', (req, resp) => resp.send({
  currentIssue: game.currentIssue || null,
  votesCast: game.getResults(),
  numPlayers: Object.keys(activePlayers).length
}));

app.post('/game/vote', function (req, resp) {
  var issue = req.body.issueId;
  var sessionId = req.body.sessionId;
  var playerId = activePlayers[sessionId];
  var vote = req.body.vote;
  game.vote(playerId, vote);
  resp.send({votesCast: game.getResults()});
});

function authDecorator(func) {
  return function() {
    var req = arguments[0], resp = arguments[1];
    if (activePlayers[req.body.sessionId]) {
      return func(req, resp);
    } else {
      resp.send({errorMsg: 'Not authenticated'});
    }
  }
}

var session;
if (process.argv[2]) {
  var url = process.argv[2];
  var playerId = process.argv[3];
  if (playerId) {
    request('post', url + '/session', {
      playerId: playerId,
    }).then(function(resp) {
      console.log('Session started with session ID ', resp.sessionId);
      if (resp.sessionId) {
        session = new ClientSession(resp.sessionId, url);
        rl.on('line', (line) => session.onReadLine(line));
      } else if (resp.errorMsg) {
        console.log('Error from server: ', resp.errorMsg);
      }
    });
  }
} else {
  startServer();
  game.playerJoin('server');
  session = new ServerSession('server');
  rl.on('line', (line) => session.onReadLine(line));
}
