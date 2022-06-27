import React from 'react'
import './Sign.css'

class Sign extends React.Component{

  constructor(props){
    super(props);
    this.handleInitial = this.handleInitial.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.state = {phase:"initial", email:""};
  }

  handleInitial(){
    let emailAddress = document.getElementById('sign-container').getElementsByTagName('input')[0].value;
    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {

      if (httpRequest.readyState === XMLHttpRequest.DONE) {
          // Everything is good, the response was received.
          if (httpRequest.status === 200) {
            if (httpRequest.responseText == 'exists'){
              this.setState({phase:"login", email:emailAddress});
            } else {
              this.setState({phase:"register", email:emailAddress});
            }
          } else {
          
          }
      } else {
          // Not ready yet.
      }

    }

    httpRequest.open('POST', '/api/checkEmail', true);
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify({ "email": emailAddress}));
  }

  handleRegister(){

    let divRegister = document.getElementById('sign-register');
    let username = divRegister.getElementsByTagName('input')[0].value;
    let password =  divRegister.getElementsByTagName('input')[1].value;

    if(password !=  divRegister.getElementsByTagName('input')[2].value){
      alert("passwords dont match, put your passwords again");
      return;
    }

    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {

      if (httpRequest.readyState === XMLHttpRequest.DONE) {
          // Everything is good, the response was received.
          if (httpRequest.status === 201) {
            alert("creation successful");
          } else {
            alert("unknown error from server");
          }
      } else {
          // Not ready yet.
      }

    }

    httpRequest.open('POST', '/api/register', true);
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify({ "email": this.state.email, "username": username, "password": password}));
  }

  handleLogin(){
    let divLogin = document.getElementById('sign-login');
    let password = document.getElementsByTagName('input')[0].value;

    let httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = () => {

      if (httpRequest.readyState === XMLHttpRequest.DONE) {
          // Everything is good, the response was received.
          if (httpRequest.status === 200) {
            alert("login successful");
          } else if(httpRequest.status === 400){
            alert("invalid credentials");
          }
          else {
            alert("unknown error from server");
          }
      } else {
          // Not ready yet.
      }

    }

    httpRequest.open('POST', '/api/login', true);
    httpRequest.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    httpRequest.send(JSON.stringify({ "email": this.state.email, "password": password}));
  }
  
  handleGoBack(){
    this.setState({phase:"initial"});
  }

  render() {
    let phase = this.state.phase;
    let content;
    if(phase == 'initial'){
      content = <Initial onClick={this.handleInitial}/>;
    }else if(phase == 'login'){
      content = <Login email={this.state.email} onClick={this.handleLogin}/>;
    }else{
      content = <Register email={this.state.email} onClick={this.handleRegister} />;
    }

    return (
      <div id="sign-container">
        {content}
        {this.state.phase != 'initial' &&
          <button onClick={this.handleGoBack}>Go Back</button>
        }
      </div>
    );

  }

}

function Initial(props){
  return(
    <div id="sign-initial">
      <p>Enter your email</p>
      <input type="email"></input>
      <button onClick={props.onClick}>continue</button>
    </div>
  );
}

function Login(props){
  return(
    <div id="sign-login">
      <p>Please enter your password for <b>{props.email}</b></p>
      <input type="password"></input>
      <button onClick={props.onClick}>Login</button>
    </div>
  );
}

function Register(props){
  return(
    <div id="sign-register">
      <p>Register your email <b>{props.email}</b></p>
      <p>username:</p>
      <input></input>
      <p>password:</p>
      <input type="password"></input>
      <p>password again:</p>
      <input type="password"></input>
      <button onClick={props.onClick}>Register</button>
    </div>
  );
}

export default Sign;
  