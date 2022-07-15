import React from 'react';
import * as HelperFunctions from '../components/HelperFunctions';
import Lobby from '../components/Home/Lobby';
import Queue from '../components/Home/Queue';
import './Home.css';

class Home extends React.Component{
  constructor(props){
    super(props);

    this.handleContentChange = this.handleContentChange.bind(this);

    this.state = {content:'lobby'};
    this.matchLength = 0;
  }

  handleContentChange(contentName, matchLength){
    this.matchLength = matchLength;
    this.setState({content : contentName});
  }

  render(){
    if(this.state.content == 'queue')
      return(<Queue matchLength={this.matchLength} handleContentChange={this.handleContentChange} />);
    else
      return(<Lobby contentChange={this.handleContentChange} />);
  }
  
}

export default Home;
  