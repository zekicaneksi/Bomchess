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
    try { // In try block because WSSGame may be deleted while foreach is working.
        Games.forEach(wssGame => {
            if(wssGame.players.includes(ws.user._id.toString())){
                alreadyPlaying = true;
                ws.send("already has a match, cannot join queue");
                return;
            }
        });    
    } catch (error) {
        
    }
    
    if(alreadyPlaying){
        return ws.close();
    }

    // Check if there's a match in queue
    let isThereAMatch = false;
    usersInQueue.forEach((wsInList, key) => {
        if(ws.matchLength == wsInList.matchLength){

           isThereAMatch = true;

            // Create the game
            let initialData = {};
            initialData.players=[ws.user._id.toString(),wsInList.user._id.toString()];
            initialData.orientation={};
            initialData.orientation.white = [initialData.players[0]];
            initialData.orientation.black = [initialData.players[1]];
            initialData.matchLength = ws.matchLength;

            let WSSGame = createWSSGame(initialData);
            Games.set(initialData.players[0] +':' + initialData.players[1], WSSGame);

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