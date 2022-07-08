import React, {useEffect, useState, useRef} from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import './Game.css';

const Game = () => {

  const [game, setGame] = useState(new Chess());
  const [loadBoard, setLoadBoard] = useState(false);

  const socket = useRef();
  const initials = useRef({});

  const [blackRemainingTime, setBlackRemainingTime] = useState(0);
  const [whiteRemainingTime, setWhiteRemainingTime] = useState(0);
  const turn = useRef();
  const timer = useRef();

  // Function to update the board
  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  // Function to check if the game is ended or not
  function checkGameEnd(){
    if(game.game_over()){
      if(game.in_checkmate()){
        let winner = "b";
        if(game.turn() == "b")
          winner="w";
        alert('game has ended via checkmate, the winner is: ' + winner);
      }else if(game.in_draw()){
        if(game.in_stalemate()){
          alert('game has ended as a draw in stalemate');
        }else if(game.in_threefold_repetition()){
          alert('game has ended as a draw in threefold repetition');
        }else if(game.insufficient_material()){
          alert('game has ended as a draw in insufficient material');
        }
      }
      return true;
    }
    return false;
  }

  function onDrop(sourceSquare, targetSquare) {

    // Make the move
    let move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

    // Move is illegal
    if(move === null)  return false;

    // Move is legal, update the board
    safeGameMutate((game) => {
      game.move(move);
    });

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

        safeGameMutate((game) => {
            game.move(content.move);
        });

        setBlackRemainingTime(content.blackRemainingTime);
        setWhiteRemainingTime(content.whiteRemainingTime);
        turn.current = (turn.current=='w' ? 'b' : 'w');

        // Check if the game ended
        checkGameEnd();

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
            setBlackRemainingTime((oldTime) => oldTime-1);
          else
            setWhiteRemainingTime((oldTime) => oldTime-1);
        },1000);
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
    return(
    <div>
      <Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation={initials.current.orientation} isDraggablePiece={isDraggablePiece}/>
      <p className='game-timer'>{(initials.current.orientation == "white") ? String(blackRemainingTime) : String(whiteRemainingTime)}</p>
      <p className='game-timer'>{(initials.current.orientation == "white") ? String(whiteRemainingTime) : String(blackRemainingTime)}</p>
    </div>);
  }

};

export default Game;