import React, {useEffect, useState, useRef} from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import { Navigate, useOutletContext } from "react-router-dom";
import {Chess} from "chess.js";
import GameBoard from "../components/GameBoard";
import MovesList from '../components/MovesList';
import Chat from '../components/Chat.js';
import './Game.css';

const Game = (props) => {

  const isInitialMount = useRef(true);
  const userInfo = useOutletContext().userInfo;

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);

  const [loadBoard, setLoadBoard] = useState(false);
  const [isGameEnded, setIsGameEnded] = useState(false);

  const [navigateBack, setNavigateBack] = useState(false);
  const [popupDiv, setPopupDiv] = useState('-');
  const [switchTabDiv, setSwitchTabDiv] = useState('-');

  const [chatMessages, setChatMessages] = useState([]);

  const socket = useRef();
  const initials = useRef({});

  const [blackRemainingTime, setBlackRemainingTime] = useState(0);
  const [whiteRemainingTime, setWhiteRemainingTime] = useState(0);
  const [drawOffer, setDrawOffer] = useState('-');
  const turn = useRef();

  
  const timer = useRef();
  const lastMoveTimestamp = useRef(new Date().getTime());
  const holdPlayerRemainingTime = useRef();

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
    if(socket.current.readyState === 2 || socket.current.readyState === 3) return(-1);
    let toSend={};
    toSend.type = 'message';
    toSend.msg = msg;
    socket.current.send(JSON.stringify(toSend));
  }

  // Setup the web socket
  function setUpWebSocket(){
    // Create the WebSocket
    socket.current = new WebSocket((process.env.REACT_APP_SECURE=="true" ? 'wss://' : 'ws://')+ process.env.REACT_APP_BACKEND_ADDRESS + '/ws/game');
        
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

    socket.current.addEventListener('close', function (event) {
      setSwitchTabDiv(
        <div className='game-report-div'>

        <p className='game-report-div-middle'>Please switch to your recently opened tab, or refreshed page</p>

      </div>
      )
    });

    // Connection failed
    socket.current.addEventListener('error', function (event) {
      console.log("can't connect");
    });
  }

  function onSquareClickCallback(move){
    let toSend = {};
    toSend.type = 'play';
    toSend.move = move;
    socket.current.send(JSON.stringify(toSend));
  }

  function onDropCallback(move){
    let toSend = {};
    toSend.type = 'play';
    toSend.move = move;
    socket.current.send(JSON.stringify(toSend));
  }

  function showReportDiv(jsonData){

    const handleSubmit = (e) => {
      // don't send anything if neither checkboxes are checked

      function report(jsonData){
        let responseFunction = (httpRequest) => {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
              setPopupDiv('-');
            } else {
              alert("unknown error from server");
            }
          }
      }

      HelperFunctions.ajax('/report','POST',responseFunction,jsonData);
      }

      if(e.target[0].checked){
        report({
          sourceUsername: initials.current.orientation === 'black' ? initials.current.black.username : initials.current.white.username,
          targetUsername: initials.current.orientation === 'white' ? initials.current.black.username : initials.current.white.username,
          type:"chat",
          content: chatMessages
        });
      }

      if(e.target[1].checked){
        report({
          sourceUsername: initials.current.orientation === 'black' ? initials.current.black.username : initials.current.white.username,
          targetUsername: initials.current.orientation === 'white' ? initials.current.black.username : initials.current.white.username,
          type:"game",
          content: initials.current.gameDate
        });
      }

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

          <div>
            <input type="submit" value="Submit"/>
            <button onClick={() => {setPopupDiv('-')}}>Cancel</button>  
          </div>
          
        </form>

      </div>
    );

  }

  function showGameResultDiv(dataJson){

    let matchResult;
    let endedBy = (dataJson.endedBy === 'drawOffer' ? 'draw' : dataJson.endedBy);

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
        <p>{'Ended By: ' + endedBy}</p>
        
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
    }
  },[]);

  if(loadBoard == false){
    return(<p>Loading...</p>);
  }
  else{

    let toShow_blackTime = HelperFunctions.milisecondsToChessCountDown(blackRemainingTime);
    let toShow_whiteTime = HelperFunctions.milisecondsToChessCountDown(whiteRemainingTime);

    let whiteUsername = <a href={"/profile/"+initials.current.white.username} target={'_blank'}>{initials.current.white.username}</a>
    let blackUsername = <a href={"/profile/"+initials.current.black.username} target={'_blank'}>{initials.current.black.username}</a>

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
            <MovesList moves={moves} orientation={'v'}/>
          </div>

          <div className='chat-div'>
            <Chat Messages={chatMessages} handleSendMessage={handleSendMessage} banDate={userInfo.bans.chat}/>
          </div>

        </div>

        <div className='game-middle-column'>
          <div className='game-board-container'>
              <GameBoard 
                game={game}
                setGame={setGame}
                myColor = {initials.current.orientation[0]}
                onSquareClickCallback={onSquareClickCallback}
                onDropCallback={onDropCallback}
                arePiecesDraggable={!isGameEnded}
              />
          </div>
        </div>

        <div className='game-right-column'>

          <div className='report-chat-div'>
            <button onClick={showReportDiv}></button>
          </div>

          <div className="game-user-timer-top">
            
            <p>{(initials.current.orientation == "white") ? toShow_blackTime : toShow_whiteTime}</p>
            <p>{(initials.current.orientation == "white") ? blackUsername : whiteUsername}</p>

          </div>

          <div className="game-messages">

            {showAbortMessage && <p>If player doesn't make a move in first 30 seconds, match will be aborted</p>}
            {drawOffer != "-" && <p>{(drawOffer == 'b' ? 'black' : 'white') + ' is offering a draw'}</p>}

          </div>

          <div className='game-user-timer-bottom'>

            <p>{(initials.current.orientation == "white") ? whiteUsername : blackUsername}</p>
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
        {(switchTabDiv != '-' && switchTabDiv)}

      </div>
    
    );
  }

};

export default Game;