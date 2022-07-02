const ws = require("ws");

const WSSLobby = new ws.WebSocketServer({ noServer: true });

// Used as a response to 'ping'
function heartbeat(){
  this.isAlive = true;
}

WSSLobby.on('connection', (ws,req) => {

  // Ping-pong messages to keep the connection active
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  // Send the active users
  WSSLobby.clients.forEach((webSocket) => {
    ws.send('connected:'+webSocket.user.username);
  });

  // Let the other users know the newcomer
  WSSLobby.clients.forEach((webSocket) => {
    webSocket.send('connected:'+ws.user.username);
  });

  // Broadcast messages
  ws.on('message', (data) => {
    WSSLobby.clients.forEach((webSocket) => {
      webSocket.send('message:'+ws.user.username+":"+data);
    });
  });

  // Broadcast the leaver
  ws.on('close', () => {
    WSSLobby.clients.forEach((webSocket) => {
      webSocket.send('disconnected:'+ws.user.username);
    });
  });

});

// Ping-pong messages to detect and close broken connections
const interval = setInterval( () => {

    WSSLobby.clients.forEach( (ws) => {
    if (ws.isAlive === false) {
        return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
    });

}, 10000);

WSSLobby.on('close', function close() {
    clearInterval(interval);
});

module.exports = WSSLobby;