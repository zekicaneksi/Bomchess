import {React, useEffect, useState, useRef} from 'react'
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
          <a><p>{props.username}&nbsp;{props.unreadMessage && <span className='unreadBadge'>!</span>}</p></a>
          <div className="dropdown-content">
            <a onClick={profileBtnHandle}>Profile&nbsp;{props.unreadMessage && <span className='unreadBadge'>!</span>}</a>
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
  const [unreadMessage, setUnreadMessage] = useState(false);

  let location = useLocation();

  const layoutSocket = useRef();


  function setUpLayoutSocket(){
    
    layoutSocket.current = new WebSocket((process.env.REACT_APP_SECURE=="true" ? 'wss://' : 'ws://')+ process.env.REACT_APP_BACKEND_ADDRESS + '/ws/layout');
    
    // Listen for messages
    layoutSocket.current.addEventListener('message', function (event) {

      let dataJson = JSON.parse(event.data);

      if(dataJson.type == 'connected'){
        if(dataJson.unreadMessage === 'yes') setUnreadMessage(true);
      } else if (dataJson.type === 'newMessage'){
        setUnreadMessage(true);
      }

    });

    layoutSocket.current.addEventListener('error', function (event) {
      console.log("can't connect");
    });
  }
  
  function checkSession(){
    let responseFunction = (httpRequest) => {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {

          let responseJson = JSON.parse(httpRequest.responseText);
          
          setUserInfo(responseJson);
          setIsLoggedIn("true");
          setUpLayoutSocket();

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

  useEffect(() => {
    // --- ComponentWillUnmount
    return () => {
      try{
        layoutSocket.current?.close();
      } catch (error) {
        console.log(error);
      }
    }
  },[]);

  // Render

  if(isLoggedIn == "false")
  {
    return (<Navigate to='/sign' />);
  } 
  else if (isLoggedIn == "true")
  {

    if(userInfo.hasGame == "yes" && location.pathname == '/'){
      return (<Navigate to='/game' />);
    } else if (userInfo.hasGame == "no" && location.pathname == '/game'){
      return (<Navigate to='/' />);
    } else{
      return (
        <div className="fill">
          <Navbar
          username={userInfo.username}
          logoutBtnHandle={logoutBtnHandle}
          unreadMessage={unreadMessage}
          setUnreadMessage={setUnreadMessage}/>
          <div id='content-div'>
            <Outlet context={{userInfo: userInfo, setUnreadMessage:setUnreadMessage, unreadMessage:unreadMessage}}/>
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