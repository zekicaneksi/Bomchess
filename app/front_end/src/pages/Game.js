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
    socket.current.send("play:"+JSON.stringify(move));
    
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

  useEffect(() => {

    // --- ComponentDidMount

    // Create the WebSocket
    socket.current = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/game');
    
    // Listen for messages
    socket.current.addEventListener('message', function (event) {

      // Parse the message
      let type = event.data.substring(0,event.data.indexOf(':'));
      let content = event.data.substring(event.data.indexOf(':')+1);

      if(type == 'play'){

        content = JSON.parse(content);

        // Set the current turn
        turn.current = (turn.current=='w' ? 'b' : 'w');
        
        // Make the move
        let gameCopy = {...game};
        gameCopy.move(content.move);
        setGame(gameCopy);

        // Calculate the latency if it's the player's turn and render it
        if(turn.current == initials.current.orientation[0]){
          if(turn.current == "w"){
            setWhiteRemainingTime(content.whiteRemainingTime-((new Date().getTime()) - content.timestamp));
            setBlackRemainingTime(content.blackRemainingTime);
          }
          else{
            setWhiteRemainingTime(content.whiteRemainingTime);
            setBlackRemainingTime(content.blackRemainingTime-((new Date().getTime()) - content.timestamp));
          }
        }

        // initials is sent when connected to setup the game
      } else if (type=="initials"){
        initials.current = JSON.parse(content);
        setBlackRemainingTime(initials.current.blackRemainingTime);
        setWhiteRemainingTime(initials.current.whiteRemainingTime);
        game.load(initials.current.position);
        turn.current=game.turn();
        setLoadBoard(true);

        // Start the countdown timer for the remaining times
        timer.current = setInterval(() => {
          if(turn.current == 'b')
            setBlackRemainingTime((oldTime) => oldTime-100);
          else
            setWhiteRemainingTime((oldTime) => oldTime-100);
        },100);
      } else if (type=="end"){
        clearInterval(timer.current);
        timer.current=null; // For safety, in case of being clearInterval'd again.

        content = JSON.parse(content);

        setWhiteRemainingTime(content.whiteRemainingTime);
        setBlackRemainingTime(content.blackRemainingTime);

        setIsGameEnded(true);
        alert(JSON.stringify(content));
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