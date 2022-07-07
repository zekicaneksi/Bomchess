import React, {useEffect, useState, useRef} from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";

const Game = () => {

  const [game, setGame] = useState(new Chess());
  const [loadBoard, setLoadBoard] = useState(false);

  const socket = useRef();
  const initials = useRef({});

  // Function for move validation
  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

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
    // Validate the move
    let move = null;
    safeGameMutate((game) => {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });
    });

    // Move is illegal
    if (move === null) return false;

    // Move is legal
    socket.current.send("play:"+JSON.stringify(move));
    
    return true;
  }

  function isDraggablePiece({piece, sourceSquare}){

    if(piece[0] != initials.current.orientation[0]){
      return false;
    }else{
      return true;
    }
      
  }

  useEffect(() => {

    // --- ComponentDidMount
    socket.current = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/game');
    
    // Connection opened
    socket.current.addEventListener('open', function (event) {
        
    });
    
    // Listen for messages
    socket.current.addEventListener('message', function (event) {
      let type = event.data.substring(0,event.data.indexOf(':'));
      let content = event.data.substring(event.data.indexOf(':')+1);

      if(type == 'play'){
        content = JSON.parse(content);
        safeGameMutate((game) => {
            game.move({
            from: content.from,
            to: content.to,
            promotion: content.promotion, // always promote to a queen for example simplicity
          });
        });

        // Check if the game ended
        checkGameEnd();

      } else if (type=="initials"){
        initials.current = JSON.parse(content);
        game.load(initials.current.position);
        setLoadBoard(true);
      }

    });

    // Connection opened
    socket.current.addEventListener('error', function (event) {
      // in here, i need to make chat box passive like unaccessible looking for the user
      alert("can't connect");
    });

    // --- ComponentWillUnmount
    return () => {
      socket.current.close();
    }
  }, []);

  if(loadBoard == false){
    return(<p>Loading...</p>);
  }
  else{
    return(<Chessboard position={game.fen()} onPieceDrop={onDrop} boardOrientation={initials.current.orientation} isDraggablePiece={isDraggablePiece}/>);
  }

};

export default Game;