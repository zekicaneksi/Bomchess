import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';

const MessagesBox = (props) => {

    const [messageBoxNav, setMessageBoxNav] = useState('main');


    let sendersAndMessages = []; // Sorted array of profileInfo.messages IF messageBoxNav is 'main'


    function userDivOnclick(event, key){
        console.log(key);
        let index = sendersAndMessages.findIndex(item => item.sender === key);
        console.log(sendersAndMessages[index]);
    }

    function sortMessagesForEachUser(array) {
        array = array.sort(function(a, b) {
            let key = "date";
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
    }

    function sortUsers(array){
        array = array.sort(function (a,b) {
            var x = a.messages[a.messages.length-1];
            var y = b.messages[b.messages.length-1];

            if(props.profileInfo.username === x.sender) x.isRead = true;
            if(props.profileInfo.username === y.sender) y.isRead = true;

            if(!x.isRead && y.isRead) return -1;
            if(x.isRead && !y.isRead) return 1;
            
            return (x.date > y.date ? -1 : ((x.date < y.date ? 1 : 0)));
        });
    }

    if(messageBoxNav === 'main'){

        // Group the senders and their messages
        for(let message in props.profileInfo.messages){
            let sender = props.profileInfo.messages[message].sender;
            sender = (sender === props.profileInfo.username ? props.profileInfo.messages[message].receiver : sender);
            if(!sendersAndMessages.some(item => item.sender === sender)) sendersAndMessages.push({sender: sender, messages: []});
            let index = sendersAndMessages.findIndex(item => item.sender === sender);
            sendersAndMessages[index].messages.push(props.profileInfo.messages[message]);
        }

        // Order the messages by different senders by date
        for(let sender in sendersAndMessages){
            sortMessagesForEachUser(sendersAndMessages[sender].messages);
        }

        sortUsers(sendersAndMessages);

        const messageboxUsers= sendersAndMessages.map((user, index) => {
            let lastMessage = user.messages[user.messages.length-1];
            let date = new Date(lastMessage.date);
            date = date.getUTCDay() + "/" + date.getUTCMonth() + "/" + date.getUTCFullYear() + " " + date.getUTCHours() + ':' + date.getUTCMinutes()
            return(
            <div key={user.sender} onClick={(event) => userDivOnclick(event,user.sender)} className='profile-messagebox-user' style={{backgroundColor: (!lastMessage.isRead ? 'rgb(115 118 134)' : 'rgb(120 115 115)')}}>
                <p>{user.sender}</p>
                <p>{date}</p>
            </div>
            );
        });


        return(
            <div className='profile-messagebox-container'>
                {messageboxUsers}
            </div>
        );
    }
}

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
                        {profileInfo.userIsMe ? <div><MessagesBox profileInfo={profileInfo}/></div> : <textarea placeholder='your message...'maxLength="250" ref={messageTextareaRef}></textarea>}
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