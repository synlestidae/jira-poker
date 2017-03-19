'use strict';
var request = require('./api').request;

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
    if (command.command == 'vote' && command.param >= 0) {
      console.log('Voting', command.param);
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

module.exports = {
 ClientSession: ClientSession,
 ServerSession: ServerSession 
};;
