import React from 'react'
import './Sign.css'

class Sign extends React.Component{

  constructor(props){
    super(props);
    this.handleContinue = this.handleContinue.bind(this);
  }

  handleContinue(){
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {

    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        // Everything is good, the response was received.
        if (httpRequest.status === 200) {
          console.log(httpRequest.responseText);
        } else {
        
        }
    } else {
        // Not ready yet.
    }

    }
    let emailAddress = document.getElementById('sign-container').getElementsByTagName('input')[0].value;
    httpRequest.open('POST', '/checkEmail', true);
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify({ "email": emailAddress}));
  }

  render() {
    return(
      <div id="sign-container">
        <p>Enter your email</p>
        <input type="email"></input>
        <button onClick={this.handleContinue}>continue</button>
      </div>
    );
  }
}

export default Sign;
  