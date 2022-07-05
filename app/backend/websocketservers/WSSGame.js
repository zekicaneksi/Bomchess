import WebSocket, { WebSocketServer } from 'ws';
import { Chess } from 'chess.js'

import {Games} from './Share.js';

const WSSGame = new WebSocketServer({ noServer: true });
const chess = new Chess();

// Used as a response to 'ping'
function heartbeat(){
    this.isAlive = true;
}

WSSGame.on('connection', (ws,req) => {

    // Send user the orientation
    if(WSSGame.orientation.white == ws.user._id.toString()){
        ws.send("orientation:white");
    }
    else{
        ws.send("orientation:black");
    }

    ws.on('message', (data) => {
        
        data = data.toString();
        
        let type = data.substring(0,data.indexOf(':'));
        let content = data.substring(data.indexOf(':')+1);

        if(type == 'play'){
            if(chess.move(JSON.parse(content)) != null){
                WSSGame.clients.forEach((webSocket) => {
                    webSocket.send(data);
                });
            }
            
        }
    });

    // Ping-pong messages to keep the connection active
    ws.isAlive = true;
    ws.on('pong', heartbeat);

});

// Ping-pong messages to detect and close broken connections
const interval = setInterval( () => {

    WSSGame.clients.forEach( (ws) => {
    if (ws.isAlive === false) {
        return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
    });

}, 10000);

WSSGame.on('close', function close() {
    clearInterval(interval);
    Games.delete(WSSGame.players[0].id.toString(),WSSGame.players[1].id.toString());
});

function createWSSGame(){
    return WSSGame;
}

export {createWSSGame};