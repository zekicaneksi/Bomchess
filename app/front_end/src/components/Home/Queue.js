import React from 'react'
import * as HelperFunctions from '../../components/HelperFunctions';
import { Navigate } from "react-router-dom";

class Queue extends React.Component{
    constructor(props){
        super(props);

        this.state = {navigate : '0'};

        this.socket = WebSocket;
    }

    componentDidMount(){
       
        this.socket = new WebSocket('ws://localhost:'+ HelperFunctions.apiPort + '/api/queue?matchLength='+this.props.matchLength);
    
        let holdThis = this;
        
        // Listen for messages
        this.socket.addEventListener('message', function (event) {
            if(event.data == 'matched'){
                holdThis.setState({navigate: '1'});
            }
        });
    
        // Connection opened
        this.socket.addEventListener('error', function (event) {
          alert("unknown error");
        });
    
      }

      componentWillUnmount(){
        this.socket.close();
      }

    render(){
        if(this.state.navigate == '0')
            return(<p>Searching for a {this.props.matchLength} min long game...</p>);
        else
            return(<Navigate to='/game' />);
    }

}

export default Queue;