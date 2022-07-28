import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';


const MatchHistoryBox = (props) => {

    const isInitialMount = useRef(true);
    
    const [matchCountToShow, setMatchCountToShow] = useState(10);
    const historyBoxContainerRef = useRef();

    function handleMatchElementDivClick(key){
        console.log('navigate me to ' + key + ' homie');
    }

    function handleScroll(){
        if(historyBoxContainerRef.current.scrollTop + historyBoxContainerRef.current.offsetHeight +1 >= historyBoxContainerRef.current.scrollHeight){
            setMatchCountToShow(old => old+10);
        }
    }

    function handleResize(){
        if(historyBoxContainerRef.current.scrollHeight <= historyBoxContainerRef.current.clientHeight){
            setMatchCountToShow(old => old+10);
        }
    }

    useEffect(() => {

        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            
            historyBoxContainerRef.current.addEventListener('scroll',handleScroll);
            window.addEventListener('resize', handleResize);

            handleResize();
        } else {
            // ComponentDidUpdate
            handleResize();
        }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
            historyBoxContainerRef.current.removeEventListener('scroll',handleScroll);
            window.removeEventListener('resize', handleResize);
        }
    },[]);

    let matchElements = [];

    let matchCount = props.profileInfo.matches.length;
    for(let i= matchCount -1 ; i >= 0 && i >= matchCount - matchCountToShow; i--){
        let match = props.profileInfo.matches[i];
        let matchResult;
        if(match.endedBy === 'abort') matchResult = 'Abort';
        else if(match.winner === '-') matchResult = 'Draw';
        else{
            let userColor = (props.profileInfo.username === match.black ? 'b' : 'w');
            if(userColor === match.winner) matchResult = 'Won';
            else matchResult = 'Lost';
        }
        matchElements.push(
            <div 
            className={'profile-matchhistory-element-container '+ (matchResult === 'Won' ? 'profile-win-background' : (matchResult === 'Lost' ? 'profile-lose-background' : ''))}
            key={match.id}
            onClick={() => handleMatchElementDivClick(match.id)}>
                <div>
                    <p>{matchResult}</p>
                </div>
                <div className='profile-matchhistory-middle-div'>
                    <p>{match.white}</p>
                    <p>{match.length}</p>
                    <p>{match.black}</p>
                </div>
                <div>
                    <p>{HelperFunctions.epochToDate(match.date)}</p>
                </div>
            </div>
        );
    }

    return(
        <div className="profile-matchhisotrybox-container" ref={historyBoxContainerRef}>
            {matchElements}
        </div>
    );
}


const MessagesBox = (props) => {

    const [messageBoxNav, setMessageBoxNav] = useState('main');
    const [forceRender, setForceRender] = useState(0);

    const messageTextareaRef = useRef();
    const sendMessageBtnRef = useRef();
    const replyTextArea = useRef();
    const replyBtn = useRef();

    const initialUnsortedMessages = useRef(props.profileInfo.messages);
    const sendersAndMessages = useRef([]); // Sorted array of props.profileInfo.messages

    function reRenderComponent(){
        setForceRender((old) => {
            if(old === 100) return 0;
            else return old+1;
        })
    }

    function userDivOnclick(event, key){
        setMessageBoxNav(key);
        let index = sendersAndMessages.current.findIndex(item => item.sender === key);
        let msg = sendersAndMessages.current[index].messages.at(-1);

        // Let the server know that i read the message
        if(msg.isRead === false && msg.sender !== props.profileInfo.username){

            let toSend = {};
            toSend.messageIDs = [];

            // Put the read messages into toSend.messageIDs
            for(let i=sendersAndMessages.current[index].messages.length-1; i >= 0; i--){
                let holdMsg = sendersAndMessages.current[index].messages[i];
                if(holdMsg.isRead === true) break;
                toSend.messageIDs.push(holdMsg._id);
            }

            // Update the initialUnsortedMessages
            for(let i=0; i < initialUnsortedMessages.current.length; i++){
                for(let msgId in toSend.messageIDs){
                    if(initialUnsortedMessages.current[i]._id === toSend.messageIDs[msgId]) {
                        initialUnsortedMessages.current[i].isRead = true;
                    }
                }
            }
    
            HelperFunctions.ajax('/message/read','POST',() => {},toSend);
        }

    }

    function sortMessages(){

        sendersAndMessages.current = [];

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

        // Group the senders and their messages
        for(let message in props.profileInfo.messages){
            let sender = props.profileInfo.messages[message].sender;
            sender = (sender === props.profileInfo.username ? props.profileInfo.messages[message].receiver : sender);
            if(!sendersAndMessages.current.some(item => item.sender === sender)) sendersAndMessages.current.push({sender: sender, messages: []});
            let index = sendersAndMessages.current.findIndex(item => item.sender === sender);
            sendersAndMessages.current[index].messages.push(props.profileInfo.messages[message]);
        }

        // Order the messages by different senders by date
        for(let sender in sendersAndMessages.current){
            sortMessagesForEachUser(sendersAndMessages.current[sender].messages);
        }

        sortUsers(sendersAndMessages.current);

    }

    function handleSendMsgBtn(){

        let toSend = {};
        toSend.message = messageTextareaRef.current.value;
        toSend.receiver = props.profileInfo.username;

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

    function handleReplyBtn(){

        let toSend={};
        toSend.message = replyTextArea.current.value;
        toSend.receiver = messageBoxNav;

        replyBtn.current.disabled = true;
        replyTextArea.current.value = 'Sending...';

        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {

                initialUnsortedMessages.current.push(JSON.parse(httpRequest.response));

                replyTextArea.current.value = '';
                replyTextArea.current.placeholder = 'Message is sent!';
                replyBtn.current.disabled = false;

                sortMessages();
                reRenderComponent();

              } else {
                alert("unknown error from server");
              }
            }
        }

        HelperFunctions.ajax('/message','POST',responseFunction,toSend);
    }

    let elementToRender;

    if(props.profileInfo.userIsMe){

        let messagesBoxNavbar =
        <div className='profile-messagesbox-navbar'>
            {messageBoxNav != 'main' && <button onClick={() => setMessageBoxNav('main')}></button>}
            <p>Messages</p>
        </div>

        let messagesBoxInner;

        if(messageBoxNav === 'main'){

            sortMessages();
    
            const messageboxUsers= sendersAndMessages.current.map((user, index) => {
                let lastMessage = user.messages[user.messages.length-1];
                let date = HelperFunctions.epochToDate(lastMessage.date);
                return(
                <div key={user.sender} onClick={(event) => userDivOnclick(event,user.sender)} className='profile-messagebox-user' style={{backgroundColor: (!lastMessage.isRead ? 'rgb(115 118 134)' : 'rgb(120 115 115)')}}>
                    <p>{user.sender}</p>
                    <p>{date}</p>
                </div>
                );
            });
    
    
            messagesBoxInner = messageboxUsers;

        } else {
    
            let messages = [];
            let index = sendersAndMessages.current.findIndex(item => item.sender === messageBoxNav);
    
            for(let i = sendersAndMessages.current[index].messages.length-1; i>=0; i--){
                let message = sendersAndMessages.current[index].messages[i];
                let date = HelperFunctions.epochToDate(message.date);
                messages.push(
                    <div key={message._id} className="profile-messagebox-message-container">
                        <div>
                            <p>{message.sender}</p>
                            <p>{date}</p>
                        </div>
                        <div>
                            <p>{message.content}</p>
                        </div>
                    </div>
                );
            }
    
            messagesBoxInner = messages;
        }

        elementToRender = 
        <div className='profile-mymessages-container'>
            {messagesBoxNavbar}
            <div className='profile-mymessages-content-container'>
                {messagesBoxInner}
            </div>
            {messageBoxNav != 'main' &&
            <div className='profile-reply-div'>
                <textarea ref={replyTextArea} placeholder={"message..."}></textarea>
                <button onClick={handleReplyBtn} ref={replyBtn}>reply</button>
            </div>
            }
        </div>;


    } else{
        elementToRender = 
        <div className='profile-sendmessage-container'>
            <p>Send a message</p>
            <textarea placeholder='your message...'maxLength="250" ref={messageTextareaRef}></textarea>
            <button onClick={handleSendMsgBtn} ref={sendMessageBtnRef} >send message</button>
        </div>
    }

    return(
    <div className='profile-messagebox-container'>
        {elementToRender}
    </div>
    );

}

const Profile = () => {

    const isInitialMount = useRef(true);
    let routerParams = useParams();

    const [profileInfo, setProfileInfo] = useState();
    const [isEditing, setIsEditing] = useState(false);

    const bioTextareaRef = useRef();

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

    function handleEditBtn(){
        if(isEditing === false){
            setIsEditing(true);
        }
        else{
            let toSend={};
            toSend.bio = bioTextareaRef.current.value;

            bioTextareaRef.current.value = 'Sending...';

            let responseFunction = (httpRequest) => {
                if (httpRequest.readyState === XMLHttpRequest.DONE) {
                  if (httpRequest.status === 200) {
                    profileInfo.bio = toSend.bio;
                    setIsEditing(false);
                  } else {
                    alert("unknown error from server");
                  }
                }
            }

            HelperFunctions.ajax('/bio','POST',responseFunction, toSend);

        }
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
                        {isEditing ? <textarea ref={bioTextareaRef} defaultValue={profileInfo.bio}></textarea> : <p>{profileInfo.bio}</p>}
                    </div>
                    {profileInfo.userIsMe && <button onClick={handleEditBtn}>{(isEditing === false ? 'Edit' : 'Save')}</button>}
                </div>
                <div className='profile-bottom-container'>
                    <div className='profile-messages-container'>
                        <MessagesBox profileInfo={profileInfo}/>
                    </div>
                    <div className='profile-match-history-container'>
                        <p>Match History</p>
                        <MatchHistoryBox profileInfo={profileInfo} />
                    </div>
                </div>
            </div>
        );
        
    }

};

export default Profile;