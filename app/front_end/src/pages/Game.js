import React, {useEffect, useState, useRef} from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import { Navigate, renderMatches } from "react-router-dom";
import {Chess} from "chess.js";
import { Chessboard } from "react-chessboard";
import MovesList from '../components/MovesList';
import Chat from '../components/Chat.js';
import './Game.css';

const Game = () => {

  const isInitialMount = useRef(true);

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [loadBoard, setLoadBoard] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const [navigateBack, setNavigateBack] = useState(false);
  const [popupDiv, setPopupDiv] = useState('-');

  const boardContainerRef = useRef();
  const [boardWidth, setBoardWidth] = useState();

  const [chatMessages, setChatMessages] = useState([]);

  // Custom squares for Chess board
  const [optionSquares, setOptionSquares] = useState({});
  const [inCheckSquare, setInCheckSquare] = useState({});

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

    if(result != null ) inCheckBackground(); // Check and set the background to red if the king is in check


    return result;
  }

  // Check and set the background to red if the king is in check
  function inCheckBackground() {

    const board = game.board();

    if(game.in_check()){
      board.forEach((rowArray) => {
        rowArray.forEach((square) => {
          if(square == null)
            return;
          else {
            if(square.type == "k" && game.turn() == square.color){
              let toSetSquare = {};
              toSetSquare[square.square] = {
                background: 'red'
              }
              setInCheckSquare(toSetSquare);
            }
          }
        }); 
      });
    }
    else {
      setInCheckSquare({});
    }
    
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

  function offerDraw(){
    let toSend = {};
    toSend.type = "offerDraw";
    toSend.value = (drawOffer == initials.current.orientation[0] ? "no" : "yes");

    socket.current.send(JSON.stringify(toSend));
  }

  // Chat send message button handle
  function handleSendMessage(msg){
    let toSend={};
    toSend.type = 'message';
    toSend.msg = msg;
    socket.current.send(JSON.stringify(toSend));
  }

  // Setup the web socket
  function setUpWebSocket(){
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
        inCheckBackground();
        setLoadBoard(true);

        // Start the countdown timer for the remaining times
        timer.current = timerStart();

      } else if (dataJson.type=="end"){
        clearInterval(timer.current);
        timer.current=null; // For safety, in case of being clearInterval'd again.

        setWhiteRemainingTime(dataJson.whiteRemainingTime);
        setBlackRemainingTime(dataJson.blackRemainingTime);

        setIsGameEnded(true);
        showGameResultDiv(dataJson);

      } else if (dataJson.type=="offerDraw"){
        setDrawOffer((old) => (dataJson.from == old ? '-' : dataJson.from));
      } else if (dataJson.type=='message'){
        setChatMessages((old) => {
          old.push(dataJson.username + ': '+ dataJson.message);
          if(old.length >= 50) old.splice(0,8);
          return old;
        });
      }

    });

    // Connection failed
    socket.current.addEventListener('error', function (event) {
      console.log("can't connect");
    });
  }

  function resizeBoard(){
    let clientWidth = boardContainerRef.current?.clientWidth;
    let clientHeight = boardContainerRef.current?.clientHeight;


    if(clientWidth > clientHeight) setBoardWidth(clientHeight);
    else setBoardWidth(clientWidth);
  }

  function showReportDiv(){

    const handleSubmit = (e) => {
      // don't send anything if neither checkboxes are checked
      console.log(e);
      console.log(e.target[0].checked);
      console.log(e.target[1].checked);
      console.log(e.target[2].value);
      e.preventDefault();
    }

    setPopupDiv(
      <div className='game-report-div'>

        <form onSubmit={handleSubmit}>

          <h2>report for:</h2>

          <div>

            <label>
              <input type="checkbox" value='chat'/>
              Chat
            </label>

            <label>
              <input type="checkbox" value='game'/>
              Game
            </label>

          </div>

          <textarea name="description" placeholder='description'></textarea>
          <div>
            <input type="submit" value="Submit" />
            <button onClick={() => {setPopupDiv('-')}}>Cancel</button>  
          </div>
          
        </form>

      </div>
    );

  }

  function showGameResultDiv(dataJson){

    let matchResult;

    switch(dataJson.winner) {
      case '-':
        matchResult = '';
        break;
      default:
        matchResult = (dataJson.winner == initials.current.orientation[0]) ? 'You Won' : 'You Lost';
    }

    setPopupDiv(
      <div className='game-result-div'>

        <h2>{matchResult}</h2>
        <p>{'Ended By: ' + dataJson.endedBy}</p>
        
        <p>To see the replay of this game, please visit your profile.</p>

        <button onClick={() => setNavigateBack(true)}>OK</button>

      </div>
    );
  }


  // Update moves made when a move is made
  useEffect(() => {
    setMoves(moves_jsonToArray());
  }, [game]);

  useEffect(() => {

    if(loadBoard == true){
      resizeBoard();

      window.addEventListener('resize', resizeBoard);
    }

  }, [loadBoard]);

  useEffect(() => {

    // ComponentDidMount
    if (isInitialMount.current) {
      isInitialMount.current = false;

      setUpWebSocket();

    } else {
      // ComponentDidUpdate

   }
    
  });

  useEffect(() => {
    // --- ComponentWillUnmount
    return () => {
      socket.current.close();
      clearInterval(timer.current);
      window.removeEventListener('resize', resizeBoard);
    }
  },[]);

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

      <div className='game-container'>

        <div className='game-left-column'>

          <div className='moves-div'>
            <MovesList moves={moves} />
          </div>

          <div className='chat-div'>
            <Chat Messages={chatMessages} handleSendMessage={handleSendMessage}/>
          </div>

        </div>

        <div className='game-middle-column' ref={boardContainerRef}>
          <div className='game-board-container'>
            <Chessboard
            boardWidth={boardWidth}
            position={game.fen()}
            onPieceDrop={onDrop}
            boardOrientation={initials.current.orientation}
            isDraggablePiece={isDraggablePiece}
            arePiecesDraggable={!isGameEnded}
            onMouseOverSquare={onMouseOverSquare}
            onMouseOutSquare={onMouseOutSquare}
            customSquareStyles={{
              ...optionSquares,
              ...inCheckSquare
            }}
            />
          </div>
        </div>

        <div className='game-right-column'>

          <div className='report-chat-div'>
            <button onClick={showReportDiv}></button>
          </div>

          <div className="game-user-timer-top">
            
            <p>{(initials.current.orientation == "white") ? toShow_blackTime : toShow_whiteTime}</p>
            <p>{(initials.current.orientation == "white") ? initials.current.black.username : initials.current.white.username}</p>

          </div>

          <div className="game-messages">

            {showAbortMessage && <p>If player doesn't make a move in first 30 seconds, match will be aborted</p>}
            {drawOffer != "-" && <p>{(drawOffer == 'b' ? 'black' : 'white') + ' is offering a draw'}</p>}

          </div>

          <div className='game-user-timer-bottom'>

            <p>{(initials.current.orientation == "white") ? initials.current.white.username : initials.current.black.username}</p>
            <p>{(initials.current.orientation == "white") ? toShow_whiteTime : toShow_blackTime}</p> 

          </div>

          <div className='game-buttons'>

            <button onClick={surrender} className="game-surrender-btn"></button>

            <button
            className={drawOffer == initials.current.orientation[0] ? 'game-draw-btn' + ' game-draw-btn-cross' : 'game-draw-btn'}
            onClick={offerDraw}
            ></button>

          </div>

        </div>    

        {(popupDiv != '-' && popupDiv)}

      </div>
    
    );
  }

};

export default Game;