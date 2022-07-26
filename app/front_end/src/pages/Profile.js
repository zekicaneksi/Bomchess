import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';

const Profile = () => {

    const isInitialMount = useRef(true);
    let routerParams = useParams();

    const [profileInfo, setProfileInfo] = useState();

    const messageTextareaRef = useRef();
    const sendMessageBtnRef = useRef();

    const NotFoundPopup = () => {

        const [navigate, setNavigate] = useState(false);

        if(navigate) return(<Navigate to='/' />);
        else{
            return(
                <div className='notfoundpopup'>
                    <p>The user couldn't be found</p>
                    <button onClick={ () => setNavigate(true)}>OK</button>
                </div>
            );
        }
    }

    function handleSendMsgBtn(){

        let toSend = {};
        toSend.message = messageTextareaRef.current.value;
        toSend.receiver = profileInfo.username;

        sendMessageBtnRef.current.disabled = true;
        messageTextareaRef.current.value = 'Sending...';

        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                messageTextareaRef.current.value = '';
                messageTextareaRef.current.placeholder = 'Message is sent!';
                sendMessageBtnRef.current.disabled = false;
              } else {
                alert("unknown error from server");
              }
            }
        }

        HelperFunctions.ajax('/message','POST',responseFunction,toSend);
        
    }

    useEffect(() => {
        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;

            

            let responseFunction = (httpRequest) => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                  if (httpRequest.status === 200) {
                    setProfileInfo(JSON.parse(httpRequest.response));
                  } else if (httpRequest.status === 404) {
                    setProfileInfo('notFound');
                  } else {
                    alert("unknown error from server");
                  }
                }
            }

            HelperFunctions.ajax('/profile?username='+routerParams.username,'GET',responseFunction);

        } else {
            // ComponentDidUpdate

        }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
          
        }
    },[]);


    if(profileInfo === undefined){
        return(<p>Loading...</p>);
    } else if( profileInfo === 'notFound'){
        return(<NotFoundPopup />);
    } else {
        
        if(profileInfo.userIsMe) console.log(profileInfo.messages);
        
        return(
            <div className='profile-container'>
                <div className='profile-bio-container'>
                    <h2>{profileInfo.username}</h2>
                    {!profileInfo.userIsMe && <button className='profile-bio-report-btn'></button>}
                    <div>
                        <p>{profileInfo.bio}</p>
                    </div>
                    {profileInfo.userIsMe && <button>Edit</button>}
                </div>
                <div className='profile-bottom-container'>
                    <div className='profile-messages-container'>
                        <p>{profileInfo.userIsMe ? 'Messages' : 'Send a message'}</p>
                        {profileInfo.userIsMe ? <div></div> : <textarea placeholder='your message...'maxLength="250" ref={messageTextareaRef}></textarea>}
                        <button onClick={handleSendMsgBtn} ref={sendMessageBtnRef} >send message</button>
                    </div>
                    <div className='profile-match-history-container'>
                        <p>Match History</p>
                        <div></div>
                    </div>
                </div>
            </div>
        );
        
    }

};

export default Profile;