import WebSocket, { WebSocketServer } from 'ws';
import { Chess } from 'chess.js'

import {Games} from './Share.js';

const WSSGame = new WebSocketServer({ noServer: true });
const chess = new Chess();

// Used as a response to 'ping'
function heartbeat(){
    this.isAlive = true;
}

function checkGameEnd(){
    if(chess.game_over()){
        if(chess.in_checkmate()){
            let winner = "b";
            if(chess.turn() == "b")
                winner="w";
            console.log('game has ended via checkmate, the winner is: ' + winner);
        }else if(chess.in_draw()){
            if(chess.in_stalemate()){
                console.log('game has ended as a draw in stalemate');
            }else if(chess.in_threefold_repetition()){
                console.log('game has ended as a draw in threefold repetition');
            }else if(chess.insufficient_material()){
                console.log('game has ended as a draw in insufficient material');
            }
        }
        return true;
    }
    return false;
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
            // Check if the player has the turn to play
            if(
                (WSSGame.orientation.white == ws.user._id.toString() && chess.turn() == "w")
                ||
                (WSSGame.orientation.black == ws.user._id.toString() && chess.turn() == "b"))
                {
             
                // Validate and then make the move
                if(chess.move(JSON.parse(content)) != null){
                    WSSGame.clients.forEach((webSocket) => {
                        webSocket.send(data);
                    });

                    // Check if the game ended
                    if(checkGameEnd()){
                        
                    }
                }

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