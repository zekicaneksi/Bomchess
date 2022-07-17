import React from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import Chat from '../components/Chat.js';
import { Navigate } from "react-router-dom";
import './Home.css';

class Home extends React.Component{
  constructor(props){
    super(props);

    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.duelOnChange = this.duelOnChange.bind(this);
    this.setUpChatSocket = this.setUpChatSocket.bind(this);
    this.setUpQueueSocket = this.setUpQueueSocket.bind(this);
    this.joinQueue = this.joinQueue.bind(this);
    this.cancelQueue = this.cancelQueue.bind(this);
    
    this.state = {lobbyUser:[], lobbyMessages:[], navigate : '0', inQueue : false};

    this.lobbyUser = [];
    this.lobbyMessages=[];

    this.chatSocket = null;
    this.queueSocket = null;

  }

  handleSendMessage(msg){
    this.chatSocket.send(msg);
  }

  duelOnChange(event){
    console.log(event.target.value);
  }

  setUpChatSocket(){
    this.chatSocket = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/lobby');


    let holdThis = this;
    
    // Listen for messages
    this.chatSocket.addEventListener('message', function (event) {

      let dataJson = JSON.parse(event.data);

      if(dataJson.type == 'connected'){
        if(!holdThis.lobbyUser.includes(dataJson.username))
          holdThis.lobbyUser.push(dataJson.username);
        holdThis.setState({lobbyUser: holdThis.lobbyUser});
      }
      else if(dataJson.type == 'disconnected'){
        holdThis.lobbyUser = holdThis.lobbyUser.filter(item => item !== dataJson.username);
        holdThis.setState({lobbyUser: holdThis.lobbyUser});
      }
      else if(dataJson.type == 'message'){
        holdThis.lobbyMessages.push(dataJson.username + ': '+ dataJson.message);
        if(holdThis.lobbyMessages.length >= 50) holdThis.lobbyMessages.splice(0,8);
        holdThis.setState({lobbyMessages: holdThis.lobbyMessages});
      }

    });


    this.chatSocket.addEventListener('error', function (event) {
      console.log("can't connect");
    });
  }

  setUpQueueSocket(matchLength){

    this.queueSocket = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/queue?matchLength='+matchLength);

    let holdThis = this;
    
    // Listen for messages
    this.queueSocket.addEventListener('message', function (event) {
        if(event.data == 'matched'){
            holdThis.setState({navigate: '1'});
        } else {
            console.log(event.data);
        }
    });

    this.queueSocket.addEventListener('error', function (event) {
      console.log("unknown error");
    });

  }

  joinQueue(matchLength){
    this.setUpQueueSocket(matchLength);

    this.setState({inQueue : true});
  }

  cancelQueue(){
    this.queueSocket.close();
    this.setState({inQueue : false});
  }

  componentDidMount(){
    this.setUpChatSocket();
  }

  componentWillUnmount(){
    try {
      this.chatSocket?.close();
      this.queueSocket?.close(); 
    } catch (error) {
      console.log(error);
    }
  }

  render(){

    const LobbyUserListItems = this.state.lobbyUser.map((username,index) =>
      <p key={index}>{username}</p>
    );

    if(this.state.navigate == '0'){

      return (
        <div className="home-content-container">

          <div className='home-left-div'>

            <div id="home-left-top">
              <h1>{this.state.inQueue ? 'Searching for a game...' : 'Quick Play'}</h1>
            </div>
    
            {this.state.inQueue ? 
            
              <div id="home-left-middle">
                <button className='queue-cancel-btn' onClick={this.cancelQueue}>Cancel</button>
              </div>
            
            : 

              <div id="home-left-middle">

                <div className='home-quickplay'>
                  <button onClick={() => {this.joinQueue(5)}}>5 min</button>
                  <button onClick={() => {this.joinQueue(10)}}>10 min</button>
                  <button onClick={() => {this.joinQueue(15)}}>15 min</button>
                </div>

                <div className='againstComputer'>
                  <button>Play against computer</button>
                </div>
              
              </div>
            }
            
    
            <div id="home-left-bottom">
    
              <div id="home-duel-container">
                <h2>Duel</h2>
                <div id="home-duel-top" onChange={this.duelOnChange}>
                  
                  <label>
                    <input type="radio" value="5" name="length"></input>
                    5 Min
                  </label>
                  
                  <label>
                    <input type="radio" value="10" name="length"></input>
                    10 Min
                  </label>

                  <label>
                    <input type="radio" value="15" name="length"></input>
                    15 Min
                  </label>
                  
                </div>
                <div id="home-duel-bottom">
                  <input placeholder='Username'></input>
                  <button>Duel</button>
                </div>
              </div>
    
            </div>

          </div>

          <div className='home-right-div'>

            <div id="home-chat">

              <div className='home-right-top'>
                <h1>Lobby Chat</h1>
              </div>

              <div className='home-right-middle'>
                <div>
                  <p>Online Users: {this.state.lobbyUser.length}</p>
                  {LobbyUserListItems}
                </div>
              </div>

              <div className='home-right-bottom'>
                <Chat Messages={this.lobbyMessages} handleSendMessage={this.handleSendMessage}/>
              </div>

            </div>

          </div>

        </div>
      );
    } else {
      return (
        <Navigate to='/game' />
      );
    }

  }
  
}

export default Home;
  