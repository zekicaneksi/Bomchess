const ws = require("ws");
const parse = require("url").parse;
const sessionConfig = require("./app").sessionConfig;
const mongoose = require("mongoose");
const User = require("./model/user");

const Servers = {};

Servers.wssLobby = new ws.WebSocketServer({ noServer: true });

function heartbeat(){
  this.isAlive = true;
}

Servers.wssLobby.on('connection', (ws,req) => {

  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', (data) => {
      console.log('received: %s', data);
  });

  ws.send('something from wss lobby');

  ws.on('close', () => {console.log('closedd');});
});


// Ping-pong messages for WebSocketServers to detect and close broken connections
setInterval( () => {

  Object.entries(Servers).forEach(wss => {
    Servers[wss[0]].clients.forEach( (ws) => {
      if (ws.isAlive === false) {
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  })
  
}, 15000);

const upgrade = async (request, socket, head) => {

  sessionConfig(request, {}, async () => {

    // Check if user has a session
    if(request.session.userID == undefined){
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Get the user
    const user = await User.findOne({'_id' : mongoose.Types.ObjectId(request.session.userID)});

    const { pathname } = parse(request.url);

    if (pathname === '/api/lobby') {
      // Check if user has a ban on chat
      if(user.bans.chat == true){
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check if user already has a WebSocket connection
      let webSocketExists = false;
      Servers.wssLobby.clients.forEach( (ws) => {
        if(ws.sessionId == request.session.id){
          webSocketExists = true;
          return;
        }
      });

      if(webSocketExists){
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
      }

      // Connect the user
      Servers.wssLobby.handleUpgrade(request, socket, head, function done(ws) {
        ws.sessionId = request.session.id;
        Servers.wssLobby.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }

  });


}

module.exports = upgrade;