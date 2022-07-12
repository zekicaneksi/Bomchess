import React, {useEffect, useState, useRef} from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import { Navigate } from "react-router-dom";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import './Game.css';

const Game = () => {

  const [game, setGame] = useState(new Chess());
  const [loadBoard, setLoadBoard] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);

  const socket = useRef();
  const initials = useRef({});

  const [blackRemainingTime, setBlackRemainingTime] = useState(0);
  const [whiteRemainingTime, setWhiteRemainingTime] = useState(0);
  const turn = useRef();

  
  const timer = useRef();
  const lastMoveTimestamp = useRef(new Date().getTime());
  const holdPlayerRemainingTime = useRef();


  function onDrop(sourceSquare, targetSquare) {

    // Make the move
    let gameCopy = {...game};
    let move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    })
    setGame(gameCopy);

    // Move is illegal
    if(move === null)  return false;

    // Send the move to the server
    let toSend = {};
    toSend.type = 'play';
    toSend.move = move;
    socket.current.send(JSON.stringify(toSend));
    
    return true;
  }

  // Makes opponent's pieces undraggable
  function isDraggablePiece({piece, sourceSquare}){

    if(piece[0] != initials.current.orientation[0]){
      return false;
    }else{
      return true;
    }
      
  }

  // Decreases remaining times
  function timerStart(){
    return setInterval(() => {

      const passedTimeFromLastMove = (new Date().getTime()) - lastMoveTimestamp.current;

      if(turn.current == 'b'){
        setBlackRemainingTime(holdPlayerRemainingTime.current - passedTimeFromLastMove);
      }
      else{
        setWhiteRemainingTime(holdPlayerRemainingTime.current - passedTimeFromLastMove);
      }
      
    },200);
  }

  useEffect(() => {

    // --- ComponentDidMount

    // Create the WebSocket
    socket.current = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/game');
    
    // Listen for messages
    socket.current.addEventListener('message', function (event) {

      // Parse the message

      let dataJson = JSON.parse(event.data);

      if(dataJson.type == 'play'){

        // Set the current turn
        turn.current = (turn.current=='w' ? 'b' : 'w');

        // Set the last move timestamp
        lastMoveTimestamp.current = new Date().getTime();

        // Make the move
        let gameCopy = {...game};
        gameCopy.move(dataJson.move);
        setGame(gameCopy);

        holdPlayerRemainingTime.current = (turn.current == "w" ? dataJson.whiteRemainingTime : dataJson.blackRemainingTime);

        setWhiteRemainingTime(dataJson.whiteRemainingTime);
        setBlackRemainingTime(dataJson.blackRemainingTime);

        // initials is sent when connected to setup the game
      } else if (dataJson.type=="initials"){
        initials.current = {...dataJson};
        setBlackRemainingTime(initials.current.blackRemainingTime);
        setWhiteRemainingTime(initials.current.whiteRemainingTime);
        game.load(initials.current.position);
        turn.current=game.turn();
        holdPlayerRemainingTime.current = (turn.current == "w" ? initials.current.whiteRemainingTime : initials.current.blackRemainingTime);
        setLoadBoard(true);

        // Start the countdown timer for the remaining times
        timer.current = timerStart();

      } else if (dataJson.type=="end"){
        clearInterval(timer.current);
        timer.current=null; // For safety, in case of being clearInterval'd again.

        setWhiteRemainingTime(dataJson.whiteRemainingTime);
        setBlackRemainingTime(dataJson.blackRemainingTime);

        setIsGameEnded(true);
        alert(JSON.stringify(dataJson));
      }

    });

    // Connection failed
    socket.current.addEventListener('error', function (event) {
      alert("can't connect");
    });

    // --- ComponentWillUnmount
    return () => {
      socket.current.close();
      clearInterval(timer.current);
    }
  }, []);

  if(loadBoard == false){
    return(<p>Loading...</p>);
  }
  else{

    let toShow_blackTime = HelperFunctions.milisecondsToChessCountDown(blackRemainingTime);
    let toShow_whiteTime = HelperFunctions.milisecondsToChessCountDown(whiteRemainingTime);

    if(navigateBack)
      return(<Navigate to='/' />);
    return(
    <div>
      {isGameEnded && <button className='goBackButton' onClick={() => setNavigateBack(true)}>Go Back</button>}
      <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation={initials.current.orientation} isDraggablePiece={isDraggablePiece} arePiecesDraggable={!isGameEnded}/>
      <p className='game-timer'>{(initials.current.orientation == "white") ? toShow_blackTime : toShow_whiteTime}</p>
      <p className='game-timer'>{(initials.current.orientation == "white") ? toShow_whiteTime : toShow_blackTime}</p>
    </div>);
  }

};

export default Game;