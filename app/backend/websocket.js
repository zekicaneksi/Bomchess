import ws from "ws";
import URL from 'node:url';
import {sessionConfig} from "./app.js";
import mongoose from "mongoose";
import {User} from "./model/user.js";

import {WSSLobby} from './websocketservers/WSSLobby.js';
import {WSSQueue} from './websocketservers/WSSQueue.js';

import {Games} from './websocketservers/Share.js'; // Array of WSSGame's.


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
      WSSLobby.clients.forEach( (ws) => {
        if(ws.sessionId == request.session.id){
          ws.terminate();
          return;
        }
      });

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
      WSSQueue.clients.forEach( (ws) => {
        if(ws.sessionId == request.session.id){
          ws.terminate();
          return;
        }
      });

      // Connect the user
      WSSQueue.handleUpgrade(request, socket, head, function done(ws) {
        ws.matchLength = myUrl.query.matchLength;
        ws.user = user;
        WSSQueue.emit('connection', ws, request);
      });
    } else if (pathname === '/api/game') {
      // Get the WSSGame WebSocketServer
      Games.forEach((WSSGame, key) => {
        if(key.includes(user._id.toString())){
          // Check if the WSSGame already has a websocket connection for the user
          WSSGame.clients.forEach(ws => {
            if(ws.user._id.toString() == user._id.toString()){
              ws.terminate();
              return;
            } 
          });
          // Connect the user
          WSSGame.handleUpgrade(request, socket, head, function done(ws) {
            ws.user = user;
            WSSGame.emit('connection', ws, request);
          });
          return;
        }
      });
    } else {
      socket.destroy();
    }

  });


}

export {upgrade};