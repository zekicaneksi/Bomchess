import React from 'react'
import './Sign.css'
import * as HelperFunctions from './../components/HelperFunctions.js'
import { Navigate } from "react-router-dom";

class Sign extends React.Component{

  constructor(props){
    super(props);
    this.checkSession = this.checkSession.bind(this);
    this.handleInitial = this.handleInitial.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleGoBack = this.handleGoBack.bind(this);
    this.state = {phase:"initial", email:"", isLoggedIn:""};
  }

  checkSession(){
    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          this.setState({isLoggedIn:"true"});
        } else if(httpRequest.status === 401) {
          this.setState({isLoggedIn:"false"});
        } else {
          alert("unknown error from server");
        }
      }
    }
    HelperFunctions.ajax('/checkSession','GET', responseFunction);
  }

  handleInitial(){
    let emailAddress = document.getElementById('sign-initial').getElementsByTagName('input')[0].value;

    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          if (httpRequest.responseText == 'exists'){
            this.setState({phase:"login", email:emailAddress});
          } else {
            this.setState({phase:"register", email:emailAddress});
          }
        } else {
          alert('unexpected response from server');
        }
      }
    }
    HelperFunctions.ajax('/checkEmail','POST', responseFunction, { "email": emailAddress});

  }

  handleRegister(){

    let divRegister = document.getElementById('sign-register');
    let username = divRegister.getElementsByTagName('input')[0].value;
    let password =  divRegister.getElementsByTagName('input')[1].value;

    if(password !=  divRegister.getElementsByTagName('input')[2].value){
      alert("passwords dont match, put your passwords again");
      return;
    }

    if(username == '' || password == '') {
      alert("Don't leave an empty field");
      return;
    }

    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 201) {
          this.setState({phase:"navigate"});
        } else if (httpRequest.status === 409) {
          alert('email is in use');
        }
        else {
          alert("unknown error from server");
        }
      }
    }
    HelperFunctions.ajax('/register','POST', responseFunction,
    { "email": this.state.email, "username": username, "password": password});

  }

  handleLogin(){
    let divLogin = document.getElementById('sign-login');
    let password = divLogin.getElementsByTagName('input')[0].value;

    if(password == ''){
      return;
    }

    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          this.setState({phase:"navigate"});
        } else if(httpRequest.status === 400) {
          alert('password is incorrect');
        } else if(httpRequest.status === 406) {
          alert('the user is already logged in');
        }
        else {
          alert("unknown error from server");
        }
      }
    }
    HelperFunctions.ajax('/login','POST', responseFunction,
    { "email": this.state.email, "password": password});

  }
  
  handleGoBack(){
    this.setState({phase:"initial"});
  }

  componentDidMount(){
    this.checkSession();
  }

  render() {
    let isLoggedIn = this.state.isLoggedIn;
    let phase = this.state.phase;
    let content;

    if(isLoggedIn == "true")
    {
      return (<Navigate to='/' />);
    }
    else if(isLoggedIn == ""){
      return(<div>Loading...</div>);
    }
    else{

      if(phase == 'initial'){
        content = <Initial onClick={this.handleInitial}/>;
      }else if(phase == 'login'){
        content = <Login email={this.state.email} onClick={this.handleLogin}/>;
      }else if(phase == 'navigate') {
        return(<Navigate to='/' />);
      } else {
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

}

function Initial(props){
  return(
    <div id="sign-initial">
      <h1>Enter your email</h1>
      <input type="email"></input>
      <button onClick={props.onClick}>continue</button>
    </div>
  );
}

function Login(props){
  return(
    <div id="sign-login">
      <h1>Please enter your password for <br></br> <b>{props.email}</b></h1>
      <input type="password"></input>
      <button onClick={props.onClick}>Login</button>
    </div>
  );
}

function Register(props){
  return(
    <div id="sign-register">
      <h1>Register your email <br></br><b>{props.email}</b></h1>
      <p>username</p>
      <input></input>
      <p>password</p>
      <input type="password"></input>
      <p>password again</p>
      <input type="password"></input>
      <button onClick={props.onClick}>Register</button>
    </div>
  );
}

export default Sign;
  