import React from 'react'
import './Layout.css';
import {Outlet} from "react-router-dom";
import { Navigate } from "react-router-dom";
import * as HelperFunctions from './../components/HelperFunctions.js';

class Layout extends React.Component{

  constructor(props){
    super(props);

    this.checkSession = this.checkSession.bind(this);
    this.logoutBtnHandle = this.logoutBtnHandle.bind(this);
    
    this.user = {};

    this.state = {isLoggedIn:""};
  }

  checkSession(){
    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          window.localStorage.setItem('user',httpRequest.responseText);
          this.user = JSON.parse(window.localStorage.getItem('user'));
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

  logoutBtnHandle() {
    
    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          window.localStorage.removeItem('user');
          this.setState({isLoggedIn:"false"});
        } else {
          alert("unknown error from server");
        }
      }
    }

    HelperFunctions.ajax('/logout','GET', responseFunction);

  }

  randomThing() {
    console.log("randomThing");
  }

  componentDidMount(){
    this.checkSession();
  }

  render(){

    let isLoggedIn = this.state.isLoggedIn;

    if(isLoggedIn == "false")
    {
      return (<Navigate to='/sign' />);
    } 
    else if (isLoggedIn == "true")
    {
      return (
      <div className="fill">
        <div id="navbar">
          <div><a>Bomchess</a></div>
          <div className="dropdown">
            <a>{this.user.username}</a>
            <div className="dropdown-content">
              <a>Profile</a>
              <a onClick={this.logoutBtnHandle}>Logout</a>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
      );
    }
    else {
      return (<div>Loading...</div>);
    }
    
    
  }
  
}
  
export default Layout;
  