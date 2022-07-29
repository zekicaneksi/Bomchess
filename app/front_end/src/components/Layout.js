import {React, useEffect, useState} from 'react'
import './Layout.css';
import {Outlet, Navigate, useLocation} from "react-router-dom";
import * as HelperFunctions from './../components/HelperFunctions.js';

// The navbar component for Layout to render
const Navbar = (props) => {

  const [navigate, setNavigate] = useState("-");

  let location = useLocation();

  function homepageBtnHandle(){
    setNavigate('/');
  }

  function profileBtnHandle(){
    setNavigate('/profile/'+props.username);
  }

  useEffect((old) => {
    if(old != '-'){
      setNavigate('-');
    }
  }, [navigate]);

  if (navigate !== "-" && location.pathname !== navigate){
    return (<Navigate to={navigate} />);
  } else {
    
    return(
      <div id="navbar">
        <div><a onClick={homepageBtnHandle}><p>Bomchess</p></a></div>
        <div className="dropdown">
          <a><p>{props.username}</p></a>
          <div className="dropdown-content">
            <a onClick={profileBtnHandle}>Profile</a>
            <a onClick={props.logoutBtnHandle}>Logout</a>
          </div>
        </div>
      </div>
    );
  }

}

const Layout = () => {

  const [isLoggedIn, setIsLoggedIn] = useState("");
  const [userInfo, setUserInfo] = useState({});

  let location = useLocation();

  
  function checkSession(){
    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {

          let responseJson = JSON.parse(httpRequest.responseText);
          
          setUserInfo(responseJson);
          setIsLoggedIn("true");

        } else if(httpRequest.status === 401) {
          setIsLoggedIn("false");
        } else {
          alert("unknown error from server");
        }
      }
    }
    HelperFunctions.ajax('/checkSession','GET', responseFunction);
  }

  function logoutBtnHandle() {
    
    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          setIsLoggedIn("false");
        } else {
          alert("unknown error from server");
        }
      }
    }

    HelperFunctions.ajax('/logout','GET', responseFunction);
  }

  // ComponentDidMount
  useEffect(() => {
    checkSession();
  },[]);

  useEffect(() => {
    checkSession();
  }, [location]);

  // Render

  if(isLoggedIn == "false")
  {
    return (<Navigate to='/sign' />);
  } 
  else if (isLoggedIn == "true")
  {

    if(userInfo.hasGame == "yes" && location.pathname != '/game'){
      return (<Navigate to='/game' />);
    } else if (userInfo.hasGame == "no" && location.pathname == '/game'){
      return (<Navigate to='/' />);
    } else{
      return (
        <div className="fill">
          <Navbar username={userInfo.username} logoutBtnHandle={logoutBtnHandle}/>
          <div id='content-div'>
            <Outlet context={userInfo}/>
          </div>
        </div>
      );
    }
  }
  else {
    return (<div>Loading...</div>);
  }

};

export default Layout;