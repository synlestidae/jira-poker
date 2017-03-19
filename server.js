var websocket = require('websocket');
var express = require('express');

function startServer(game, activePlayers) {

export class Session {
  constructor(game, activePlayers) {
    this.game = game;
    this.activePlayers = activePlayers;
  }

  clearSession(playerId) {
    this.game.playerLeave(playerId);
    return delete this.activePlayers[playerId];
  }

  onMessage(text) {
    var msg = JSON.parse(text);
    switch (msg.action) {
        case 'newSession': 
          return this.newSession(msg);
        case 'requestGamestate': 
          return this.requestGameState(msg);
        case 'vote': 
          return this.vote(msg);
        default: return false;
    }
  }

  newSession(msg) {
    var playerId = req.body.playerId;
    var sessionId = Math.random().toString().replace('.', '') + new Date().getTime();
    if (this.activePlayers.hasOwnProperty(playerId)) {
      return {errorMsg: 'Player with this ID already exists'};
    }
    this.activePlayers[playerId] = sessionId;
    this.game.playerJoin(playerId);
    return {
      playerId: playerId,
      sessionId: sessionId 
    };
  }

  requestGameState(msg) {
    return {
      currentIssue: this.game.currentIssue || null,
      votesCast: this.game.getResults(),
      numPlayers: Object.keys(this.activePlayers).length
    };
  }

  vote(msg) {
    var issue = msg.issueId;
    var sessionId = msg.sessionId;
    var vote = msg.vote;
    var playerId = this.activePlayers[sessionId];
    this.game.vote(playerId, vote);
    return {votesCast: game.getResults()};
  }
}

export class Server {
  constructor(ws, session) {
    this.ws = ws;
    this.session = session;
    this.connections = {};
  }

  start() {
    var server = this;
    this.ws.on('request', function(request) {
      var connection = request.accept('poker', request.origin);
      this.connections[request.remoteAddress.toString()] = connection;

      connection.on('close', function() {
        server.session.clearSession(this.connections[request.remoteAddress.toString()]);
        delete this.connections[request.remoteAddress.toString()];
      });

      connection.on('message', function(msg) {
        if (message.type === 'utf8') {
          try {
            var msg = JSON.parse(message.utf8Data);
            var response = server.session.onMessage(msg);
            if (response) {
              connection.sendUTF(JSON.stringify(response));
            }
          } catch (e) {
            //Pass
          }
        }
      });
    }
  }

  broadcast(msg) {
    this.connections.forEach(connection => connection.sendUTF(JSON.stringify(msg)));
  }
}

export function makeServer(game, activePlayers) {
  var app = express.createServer();
  var ws = new WebSocketServer({
    httpServer: app,
    fragmentOutgoingMessages: false
  });

  return new Server(game, activePlayers, ws);
}
