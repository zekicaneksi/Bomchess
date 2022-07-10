import WebSocket, { WebSocketServer } from 'ws';

import {createWSSGame} from './WSSGame.js';

import {Games} from './Share.js';

const WSSQueue = new WebSocketServer({ noServer: true });

let usersInQueue = new Map();

// Used as a response to 'ping'
function heartbeat(){
  this.isAlive = true;
}

WSSQueue.on('connection', (ws,req) => {

    // For security reasons, check if the player already has a game going on
    let alreadyPlaying = false;
    Games.forEach(wssGame => {
        if(wssGame.players.includes(ws.user._id.toString())){
            alreadyPlaying = true;
            ws.send("already has a match, cannot join queue");
            return;
        }
    });
    if(alreadyPlaying){
        return ws.close();
    }

    // Check if there's a match in queue
    let isThereAMatch = false;
    usersInQueue.forEach((wsInList, key) => {
        if(ws.matchLength == wsInList.matchLength){

           isThereAMatch = true;

            // Create the game
            let WSSGame = createWSSGame();
            WSSGame.players=[ws.user._id.toString(),wsInList.user._id.toString()];
            WSSGame.orientation={};
            WSSGame.orientation.white = [WSSGame.players[0]];
            WSSGame.orientation.black = [WSSGame.players[1]];
            WSSGame.matchLength = ws.matchLength;
            Games.set(ws.user._id.toString() +':' + wsInList.user._id.toString(), WSSGame);

            // Let the users know
            wsInList.send('matched');
            ws.send('matched');
            wsInList.close();
            return;
        }
    });
    if(isThereAMatch) return ws.close();
    
    // If there is not a match, put the user in queue
    usersInQueue.set(ws.user._id.toString(),ws);

    // On socket close, remove from the list.
    ws.on('close', () => {
        usersInQueue.delete(ws.user._id.toString());
    });

    // Ping-pong messages to keep the connection active
    ws.isAlive = true;
    ws.on('pong', heartbeat);

});

// Ping-pong messages to detect and close broken connections
const interval = setInterval( () => {

    WSSQueue.clients.forEach( (ws) => {
    if (ws.isAlive === false) {
        return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
    });

}, 10000);

WSSQueue.on('close', function close() {
    clearInterval(interval);
});

export {WSSQueue};