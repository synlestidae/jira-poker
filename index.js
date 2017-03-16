var express = require("express");
var app = express();
var bodyParser = require('body-parser');

//var bodyParser = require('body-parser')
//app.use(bodyParser);

app.use(bodyParser.json());

app.listen(3000, function() {
  console.log('listening');
});

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
    if (this.players.hasOwnPropery(playerId)) {
      return false;
    }
    this.players.hasOwnPropery[playerId] = playerId;
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

var activePlayers = {};
var game = new Game();

app.post('/session', function (req, resp) {
  console.log('req', req);
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
  console.log('voting', vote, req.body);
  game.vote(playerId, vote);
  resp.send({votesCast: game.getResults()});
});

function authDecorator(func) {
  console.log('Decorating', func);
  return function() {
    var req = arguments[0], resp = arguments[1];
    console.log('Request has been made', req.body);
    if (activePlayers[req.body.sessionId]) {
      return func(req, resp);
    } else {
      resp.send({errorMsg: 'Not authenticated'});
    }
  }
}
