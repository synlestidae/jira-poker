var WebSocketClient = require('websocket').client;

export function makeClient(url, game, activePlayers) {
    var client = new WebSocketClient();
    client.connect(url);
}
