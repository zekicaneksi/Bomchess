import WebSocket, { WebSocketServer } from 'ws';

const WSSLobby = new WebSocketServer({ noServer: true });

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
    let toSend={};
    toSend.type = 'connected';
    toSend.username = webSocket.user.username;
    ws.send(JSON.stringify(toSend));
  });

  // Let the other users know the newcomer
  WSSLobby.clients.forEach((webSocket) => {
    let toSend={};
    toSend.type = 'connected';
    toSend.username = ws.user.username;
    webSocket.send(JSON.stringify(toSend));
  });

  // Broadcast messages
  ws.on('message', (data) => {
    let toSend={};
    toSend.type = 'message';
    toSend.username = ws.user.username;
    toSend.message = data.toString();
    WSSLobby.clients.forEach((webSocket) => {
      webSocket.send(JSON.stringify(toSend));
    });
  });

  // Broadcast the leaver
  ws.on('close', () => {
    let toSend={};
    toSend.type = 'disconnected';
    toSend.username = ws.user.username;
    WSSLobby.clients.forEach((webSocket) => {
      webSocket.send(JSON.stringify(toSend));
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

export {WSSLobby};