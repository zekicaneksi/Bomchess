import ws from "ws";
import URL from 'node:url';
import {sessionConfig} from "./app.js";
import mongoose from "mongoose";
import {User} from "./model/user.js";

import {WSSLobby} from './websocketservers/WSSLobby.js';
import {WSSQueue} from './websocketservers/WSSQueue.js';
import {WSSLayout} from './websocketservers/WSSLayout.js';

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

    if (pathname === '/ws/lobby') {

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
    } else if (pathname === '/ws/queue') {

      // Check if the user is banned from playing
      if(user.bans.playing > new Date().getTime()){
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
    } else if (pathname === '/ws/game') {
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
    } else if (pathname === '/ws/layout'){
      // Check if user already has a WebSocket connection
      WSSLayout.clients.forEach( (ws) => {
        if(ws.sessionId == request.session.id){
          ws.terminate();
          return;
        }
      });
      
      // Connect the user
      WSSLayout.handleUpgrade(request, socket, head, function done(ws) {
        ws.sessionId = request.session.id;
        ws.user = user;
        WSSLayout.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }

  });


}

export {upgrade};