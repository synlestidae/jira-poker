export default class Game {
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
