import React, { useState, useRef, useEffect } from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import Chat from '../components/Chat.js';
import { Navigate , useOutletContext} from "react-router-dom";
import './Home.css';

const Home = (props) => {
  
  const [lobbyUser, setLobbyUser] = useState([]);
  const [lobbyMessages, setLobbyMessages] = useState([]);
  const [navigate, setNavigate] = useState('home');
  const [inQueue, setInQueue] = useState(false);

  const isInitialMount = useRef(true);

  const chatSocket = useRef();
  const queueSocket = useRef();

  const userInfo = useOutletContext().userInfo;

  function handleSendMessage(msg){
    if(chatSocket.current.readyState === 2 || chatSocket.current.readyState === 3) return(-1);
    chatSocket.current.send(msg);
  }

  function setUpChatSocket(){
    chatSocket.current = new WebSocket((document.location.protocol === 'http:' ? 'ws://' : 'wss://')+document.location.hostname+':'+ HelperFunctions.apiPort + '/ws/lobby');
    
    // Listen for messages
    chatSocket.current.addEventListener('message', function (event) {

      let dataJson = JSON.parse(event.data);

      if(dataJson.type == 'connected'){
        setLobbyUser((old) => {
          if(dataJson.username === userInfo.username && old.includes(dataJson.username)) return old;
          let toReturn = [...old];
          toReturn.push(dataJson.username);
          return toReturn;
        });
      }
      else if(dataJson.type == 'disconnected'){
        setLobbyUser((old) => {
          let toReturn = [...old];
          if(dataJson.username === userInfo.username) return old;
          const index = toReturn.indexOf(dataJson.username);
          if (index > -1) {
            toReturn.splice(index, 1);
          }
          return toReturn;
        });
      }
      else if(dataJson.type == 'message'){
        setLobbyMessages((old) => {
          let toReturn = [...old];
          toReturn.push(dataJson.username + ': '+ dataJson.message);
          if(toReturn.length >= 50) toReturn.splice(0,8);
          return toReturn;
        });
      }

    });

    chatSocket.current.addEventListener('error', function (event) {
      console.log("can't connect");
    });
  }

  function setUpQueueSocket(matchLength){

    queueSocket.current = new WebSocket((document.location.protocol === 'http:' ? 'ws://' : 'wss://')+document.location.hostname+':'+ HelperFunctions.apiPort + '/ws/queue?matchLength='+matchLength);
    
    // Listen for messages
    queueSocket.current.addEventListener('message', function (event) {
        if(event.data == 'matched'){
          setNavigate('game');
        } else {
          console.log(event.data);
        }
    });

    queueSocket.current.addEventListener('error', function (event) {
      console.log("unknown error");
    });
  }

  function joinQueue(matchLength){
    setUpQueueSocket(matchLength);
    setInQueue(true);
  }

  function cancelQueue(){
    queueSocket.current.close();
    setInQueue(false);
  }


  useEffect(() => {

    // ComponentDidMount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setUpChatSocket();
        
    } else {
      // ComponentDidUpdate
        
    }
    
  });

  useEffect(() => {
    // --- ComponentWillUnmount
    return () => {
      try{
        chatSocket.current?.close();
        queueSocket.current?.close();
      } catch (error) {
        console.log(error);
      }
    }
  },[]);


  const LobbyUserListItems = lobbyUser.map((username,index) =>
    <a key={index} href={"/profile/"+username} target={'_blank'}>{username}</a>
  );

  if(navigate == 'home'){

    return (
      <div className="home-content-container">

        <div className='home-left-div'>

          <div id="home-left-top">
            <h1>{inQueue ? 'Searching for a game...' : 'Quick Play'}</h1>
          </div>
  
          {userInfo.bans.playing > new Date().getTime()
          ?
          <p style={{textAlign:'center'}}>You are banned until {HelperFunctions.epochToDate(userInfo.bans.playing)}</p>
          :
          (inQueue ? 
          
            <div id="home-left-middle">
              <button className='queue-cancel-btn' onClick={cancelQueue}>Cancel</button>
            </div>
          : 
            <div id="home-left-middle">

              <div className='home-quickplay'>
                <button onClick={() => {joinQueue(5)}}>5 min</button>
                <button onClick={() => {joinQueue(10)}}>10 min</button>
                <button onClick={() => {joinQueue(15)}}>15 min</button>
              </div>

              <div className='againstComputer'>
                <button onClick={() => {setNavigate('computer')}}>Play against computer</button>
              </div>
            
            </div>
          )
          }

        </div>

        <div className='home-right-div'>

          <div id="home-chat">

            <div className='home-right-top'>
              <h1>Lobby Chat</h1>
            </div>

            <div className='home-right-middle'>
              <div>
                <p>Users in room: {lobbyUser.length}</p>
                {LobbyUserListItems}
              </div>
            </div>

            <div className='home-right-bottom'>
              <Chat Messages={lobbyMessages} handleSendMessage={handleSendMessage} banDate={userInfo.bans.chat}/>
            </div>

          </div>

        </div>

      </div>
    );
  } else if (navigate == 'game') {
    return (
      <Navigate to='/game' />
    );
  } else if (navigate == 'computer') {
    return (
      <Navigate to='/computer' />
    );
  } else {
    return(
      <p>Loading...</p>
    );
  }
  

};

export default Home;
  