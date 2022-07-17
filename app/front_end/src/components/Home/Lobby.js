import React from 'react'
import * as HelperFunctions from '../../components/HelperFunctions';

class Lobby extends React.Component{
    constructor(props){
        super(props);
    
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleContentChange = this.handleContentChange.bind(this);
        this.duelOnChange = this.duelOnChange.bind(this);

        this.state = {lobbyUser:[], lobbyMessages:[]};
    
        this.lobbyUser = [];
        this.lobbyMessages=[];
        this.socket = WebSocket;
      }

      handleContentChange(matchLength){
        this.props.contentChange('queue',matchLength);
      }
    
      handleSendMessage(){
        this.socket.send(document.getElementById('lobby-chat').getElementsByTagName('input')[0].value);
      }

      duelOnChange(event){
        console.log(event.target.value);
      }
    
      componentDidMount(){
       
        this.socket = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/lobby');
    
        // Connection opened
        this.socket.addEventListener('open', function (event) {
            
        });
    
        let holdThis = this;
        
        // Listen for messages
        this.socket.addEventListener('message', function (event) {

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
            holdThis.setState({lobbyMessages: holdThis.lobbyMessages});
          }
    
        });
    
        // Connection opened
        this.socket.addEventListener('error', function (event) {
          // in here, i need to make chat box passive like unaccessible looking for the user
          console.log("can't connect");
        });
    
      }

      componentWillUnmount(){
        this.socket.close();
      }
    
      render(){
    
        const LobbyUserListItems = this.state.lobbyUser.map((username,index) =>
          <p key={index}>{username}</p>
        );
        const LobbyMessagesItems = this.state.lobbyMessages.map((message,index) =>
          <p key={index}>{message}</p>
        );
    
        return (
          <div className="home-content-container">

            <div className='home-left-div'>

              <div id="home-left-top">
                <h1>Quick Play</h1>
              </div>
      
              <div id="home-left-middle">

                <div className='home-quickplay'>
                  <button onClick={() => {this.handleContentChange(5)}}>5 min</button>
                  <button onClick={() => {this.handleContentChange(10)}}>10 min</button>
                  <button onClick={() => {this.handleContentChange(15)}}>15 min</button>
                </div>

                <div className='againstComputer'>
                  <button>Play against computer</button>
                </div>
                
              </div>
      
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
                  <div id="lobby-chat">
                    <div className='lobby-chat-messages'>
                      {LobbyMessagesItems}
                    </div>
                    <div className='lobby-chat-input'>
                      <input></input>
                      <button onClick={this.handleSendMessage}>Send</button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
    
          </div>
        );
      }
}

export default Lobby;