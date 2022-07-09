import WebSocket, { WebSocketServer } from 'ws';
import { Chess } from 'chess.js'

import {Games} from './Share.js';

function createWSSGame(){
    const WSSGame = new WebSocketServer({ noServer: true });
    const chess = new Chess();
    
    // Used as a response to 'ping'
    function heartbeat(){
        this.isAlive = true;
    }
    
    // Checks if the game ended or not
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
    
    // Timer for the game
    let whiteRemainingTime=null;
    let blackRemainingTime=null;
    
    const gameTimer = setInterval(() => {
        if(chess.turn() == "b")
            blackRemainingTime--;
        else
            whiteRemainingTime--;

        if(whiteRemainingTime == 0 || blackRemainingTime == 0){
            clearInterval(gameTimer);
        }
    },100);
    
    WSSGame.on('connection', (ws,req) => {

        // Set the remaining times
        if(whiteRemainingTime == null){
            whiteRemainingTime = WSSGame.matchLength*60*10; // Minutes to deciseconds
            blackRemainingTime = WSSGame.matchLength*60*10; // Minutes to deciseconds
        }
            
        // JSON object to hold information about the game
        let initials ={};
    
        // Orientation
        if(WSSGame.orientation.white == ws.user._id.toString()){
            initials.orientation = "white";
        }
        else{
            initials.orientation = "black";
        }
    
        // Current position of the board
        initials.position = chess.fen();

        initials.whiteRemainingTime = whiteRemainingTime;
        initials.blackRemainingTime = blackRemainingTime;

        // Send the initials
        ws.send("initials:" + JSON.stringify(initials));
    
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
                            let toSend = {};
                            toSend.move = JSON.parse(content);
                            toSend.whiteRemainingTime = whiteRemainingTime;
                            toSend.blackRemainingTime = blackRemainingTime;
                            toSend.timestamp = new Date().getTime();
                            webSocket.send(type+':'+JSON.stringify(toSend));
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
    const pingPongInterval = setInterval( () => {
    
        WSSGame.clients.forEach( (ws) => {
        if (ws.isAlive === false) {
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
        });
    
    }, 10000);
    
    WSSGame.on('close', function close() {
        clearInterval(pingPongInterval);
        clearInterval(gameTimer);
        Games.delete(WSSGame.players[0].id.toString(),WSSGame.players[1].id.toString());
    });

    return WSSGame;
}


export {createWSSGame};