import React from 'react'
import './Layout.css';
import {Outlet} from "react-router-dom";
import { Navigate } from "react-router-dom";
import * as HelperFunctions from './../components/HelperFunctions.js';

class Layout extends React.Component{

  constructor(props){
    super(props);
    this.checkSession = this.checkSession.bind(this);
    this.state = {isLoggedIn:""};
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
      return (<div className="fill">
        <div id="navbar">
          <div><a>Bomchess</a></div>
          <div className="dropdown">
            <a>usahName</a>
            <div className="dropdown-content">
              <a>Profile</a>
              <a>Logout</a>
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
  