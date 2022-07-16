import React, {useEffect, useState, useRef} from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import { Navigate } from "react-router-dom";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import './Game.css';

// A component to render the list of moves that are made
function MovesList(props) {

  const listItems = props.moves.map((move,index) => {
    return <option key={index}>{move.from + move.to}</option>
  });

  return (
    <select>
      {listItems}
    </select>
  );
}

const Game = () => {

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [loadBoard, setLoadBoard] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);
  const [navigateBack, setNavigateBack] = useState(false);

  const [optionSquares, setOptionSquares] = useState({});

  const socket = useRef();
  const initials = useRef({});

  const [blackRemainingTime, setBlackRemainingTime] = useState(0);
  const [whiteRemainingTime, setWhiteRemainingTime] = useState(0);
  const [drawOffer, setDrawOffer] = useState('-');
  const turn = useRef();

  
  const timer = useRef();
  const lastMoveTimestamp = useRef(new Date().getTime());
  const holdPlayerRemainingTime = useRef();

  function makeAMove(moveToMake){
    // Make the move
    let gameCopy = {...game};
    let result = gameCopy.move(moveToMake);
    setGame(gameCopy);
    return result;
  }

  function onMouseOverSquare(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function onMouseOutSquare() {
    if (Object.keys(optionSquares).length !== 0) setOptionSquares({});
  }

  function onDrop(sourceSquare, targetSquare) {

    // Make the move
    let move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // always promote to a queen for example simplicity
    });

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

  // To convert json to array for move history
  function moves_jsonToArray(){
    let toReturn = [];
    for(var i in initials.current.moves){
      toReturn.push(initials.current.moves[i]);
    }

    const holdMoves = {...game.history({verbose:true})};
    for(var i in holdMoves){
      toReturn.push(holdMoves[i]);
    }

    return toReturn;
  }

  // Send the server the surrender message
  function surrender(){
    let toSend = {};
    toSend.type = "surrender";
    socket.current.send(JSON.stringify(toSend));
  }

  function offerDraw(e){
    let toSend = {};
    toSend.type = "offerDraw";
    toSend.value = (e.target.value == "yes" ? "yes" : "no");

    socket.current.send(JSON.stringify(toSend));
  }

  // Update moves made when a move is made
  useEffect(() => {
    setMoves(moves_jsonToArray());
 }, [game]);

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
        makeAMove(dataJson.move);

        holdPlayerRemainingTime.current = (turn.current == "w" ? dataJson.whiteRemainingTime : dataJson.blackRemainingTime);

        setWhiteRemainingTime(dataJson.whiteRemainingTime);
        setBlackRemainingTime(dataJson.blackRemainingTime);

        // initials is sent when connected to setup the game
      } else if (dataJson.type=="initials"){
        initials.current = {...dataJson};
        setBlackRemainingTime(initials.current.blackRemainingTime);
        setWhiteRemainingTime(initials.current.whiteRemainingTime);
        setDrawOffer(initials.current.drawOffer);
        game.load(initials.current.position);
        turn.current=game.turn();
        holdPlayerRemainingTime.current = (turn.current == "w" ? initials.current.whiteRemainingTime : initials.current.blackRemainingTime);
        setMoves(moves_jsonToArray());
        
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

      } else if (dataJson.type=="offerDraw"){
        setDrawOffer((old) => (dataJson.from == old ? '-' : dataJson.from));
      }

    });

    // Connection failed
    socket.current.addEventListener('error', function (event) {
      console.log("can't connect");
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

    let showAbortMessage = ((moves.length < 1 && (parseInt(whiteRemainingTime / 1000) < (initials.current.matchLength * 60 - 10))
                            ||
                            moves.length < 2 && (parseInt(blackRemainingTime / 1000) < (initials.current.matchLength * 60 - 10))) 
                            ? true : false);

    if(navigateBack)
      return(<Navigate to='/' />);
    return(
    <div>
      {isGameEnded && <button className='goBackButton' onClick={() => setNavigateBack(true)}>Go Back</button>}
      <Chessboard
      position={game.fen()}
      onPieceDrop={onDrop}
      boardOrientation={initials.current.orientation}
      isDraggablePiece={isDraggablePiece}
      arePiecesDraggable={!isGameEnded}
      onMouseOverSquare={onMouseOverSquare}
      onMouseOutSquare={onMouseOutSquare}
      customSquareStyles={{
        ...optionSquares
      }}
      />
      {showAbortMessage && <p>If player doesn't make a move in first 30 seconds, match will be aborted</p>}
      {drawOffer != "-" && <p>{drawOffer} is offerin a draw</p>}
      <p className='game-timer'>{(initials.current.orientation == "white") ? toShow_blackTime : toShow_whiteTime}</p>
      <p className='game-timer'>{(initials.current.orientation == "white") ? toShow_whiteTime : toShow_blackTime}</p> 
      <MovesList moves={moves} />
      <button onClick={surrender}>surrender</button>
      <p>offer draw</p>
      <select defaultValue={(drawOffer == initials.current.orientation[0] ? "yes" : "no")} onChange={offerDraw}>
        <option value={"yes"}>yes</option>
        <option value={"no"}>no</option>
      </select>
    </div>);
  }

};

export default Game;