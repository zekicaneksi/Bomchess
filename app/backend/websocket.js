const ws = require("ws");
const URL = require('node:url');
const sessionConfig = require("./app").sessionConfig;
const mongoose = require("mongoose");
const User = require("./model/user");

const WSSLobby = require('./websocketservers/WSSLobby');
const WSSQueue = require('./websocketservers/WSSQueue');

let Games = require('./websocketservers/Share').Games; // Array of WSSGame's.


const upgrade = async (request, socket, head) => {

  sessionConfig(request, {}, async () => {

    // Check if user has a valid session
    if(request.session.userID == undefined){
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Get the user
    const user = await User.findOne({'_id' : mongoose.Types.ObjectId(request.session.userID)});
    
    // Get the url and path name
    const myUrl = new URL.parse(request.url,true);
    const pathname = myUrl.pathname;

    if (pathname === '/api/lobby') {
      // Check if user has a ban on chat
      if(user.bans.chat == true){
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check if user already has a WebSocket connection
      let webSocketExists = false;
      WSSLobby.clients.forEach( (ws) => {
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
      WSSLobby.handleUpgrade(request, socket, head, function done(ws) {
        ws.sessionId = request.session.id;
        ws.user = user;
        WSSLobby.emit('connection', ws, request);
      });
    } else if (pathname === '/api/queue') {
      
      // Check if user has a ban on playing
      if(user.bans.playing == true){
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check if user already has a WebSocket connection
      let webSocketExists = false;
      WSSQueue.clients.forEach( (ws) => {
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
      WSSQueue.handleUpgrade(request, socket, head, function done(ws) {
        ws.matchLength = myUrl.query.matchLength;
        ws.sessionId = request.session.id;
        ws.user = user;
        WSSQueue.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }

  });


}

module.exports = upgrade;