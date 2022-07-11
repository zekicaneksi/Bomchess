import WebSocket, { WebSocketServer } from 'ws';
import { Chess } from 'chess.js'

import {Games} from './Share.js';

function createWSSGame(WSSGame_initialData){

    const WSSGame = new WebSocketServer({ noServer: true });
    WSSGame.initialData = WSSGame_initialData;

    const chess = new Chess();

    let moves = []; // Hold the moves that are made

    WSSGame.date = new Date().getTime(); // Date of the game
    WSSGame.endedBy = '-';

    // Variables that are used for gameTimer interval
    let gameTimer; // Hold the id of setInterval that's for user remaining time countdown.
    let whiteRemainingTime= WSSGame.initialData.matchLength*60*1000; // Minutes to miliseconds
    let blackRemainingTime= WSSGame.initialData.matchLength*60*1000; // Minutes to miliseconds
    let timePassedSinceLastCalculation = 0;
    let holdMovesLength = 0;

    
    // Used as a response to 'ping'
    function heartbeat(){
        this.isAlive = true;
    }

    // Ends the game
    function endTheGame() {

        // End the countdown timer for players
        clearInterval(gameTimer);
        gameTimer = null; // For safety, in case of multiple clearInterval's for the same id

        // Send the players match results
        let toSend = {};
        toSend.endedBy = WSSGame.endedBy;
        toSend.winner = WSSGame.winner;
        toSend.blackRemainingTime = blackRemainingTime;
        toSend.whiteRemainingTime = whiteRemainingTime;

        WSSGame.clients.forEach((webSocket) => {
            webSocket.send('end:'+JSON.stringify(toSend));
            webSocket.close();
        });

        // Close the WSSGame
        WSSGame.close();
    }
    
    // Checks if the game ended or not (excluding timeout)
    function checkGameEnd(){
        if(chess.game_over()){
            if(chess.in_checkmate()){
                WSSGame.endedBy = "checkmate"
                if(chess.turn() == "b")
                    WSSGame.winner="w";
                else
                    WSSGame.winner="b";
            }else if(chess.in_draw()){
                    WSSGame.winner="-";
                if(chess.in_stalemate()){
                    WSSGame.endedBy = "stalemate";
                }else if(chess.in_threefold_repetition()){
                    WSSGame.endedBy = "threefold";
                }else if(chess.insufficient_material()){
                    WSSGame.endedBy = "insufficient";
                } else{
                    WSSGame.endedBy = "unknown";
                }
            }
            return true;
        }
        return false;
    }


    // Timer for the game
    gameTimer = setInterval(() => {

        if(whiteRemainingTime <= 0 || blackRemainingTime <= 0){
            clearInterval(gameTimer);
            gameTimer = null; // For safety, in case of multiple clearInterval's for the same id
            WSSGame.endedBy = "timeout";
            WSSGame.winner = (whiteRemainingTime <= 0 ? 'b' : 'w');
            endTheGame();
        }
        
        const currentTime = new Date().getTime();
        let passedTimeFromLastMove;

        if(holdMovesLength != moves.length){
            holdMovesLength = moves.length;
            timePassedSinceLastCalculation = 0;
        }

        if(moves.length==0)
            passedTimeFromLastMove = currentTime - WSSGame.date;
        else
            passedTimeFromLastMove = currentTime - moves[moves.length-1].timestamp;

        if(chess.turn() == "b"){
            blackRemainingTime-= (passedTimeFromLastMove - timePassedSinceLastCalculation);
        }
        else{
            whiteRemainingTime-= (passedTimeFromLastMove - timePassedSinceLastCalculation);
        }

        timePassedSinceLastCalculation = passedTimeFromLastMove;
        holdMovesLength = moves.length;

    },100);
    
    WSSGame.on('connection', (ws,req) => {
            
        // JSON object to hold information about the game
        let initials ={};
    
        // Orientation
        if(WSSGame.initialData.orientation.white == ws.user._id.toString()){
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

                // To prevent playing a move after the game ends
                if(WSSGame.endedBy != '-')
                    return;
                
                // Check if the player has the turn to play
                if(
                    (WSSGame.initialData.orientation.white == ws.user._id.toString() && chess.turn() == "w")
                    ||
                    (WSSGame.initialData.orientation.black == ws.user._id.toString() && chess.turn() == "b"))
                    {
                 
                    // Validate and then make the move
                    let move = chess.move(JSON.parse(content));
                    if(move != null){
                        move.timestamp = new Date().getTime();
                        moves.push(move);

                        // Let the players know what move has been made
                        WSSGame.clients.forEach((webSocket) => {
                            let toSend = {};
                            toSend.move = JSON.parse(content);
                            toSend.whiteRemainingTime = whiteRemainingTime;
                            toSend.blackRemainingTime = blackRemainingTime;
                            webSocket.send(type+':'+JSON.stringify(toSend));
                        });
    
                        // Check if the game ended
                        if(checkGameEnd()){
                            endTheGame();
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
        Games.delete(WSSGame.initialData.players[0] + ':' + WSSGame.initialData.players[1]);
    });

    return WSSGame;
}


export {createWSSGame};