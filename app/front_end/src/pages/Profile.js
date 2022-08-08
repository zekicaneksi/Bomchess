import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams, useLocation, useOutletContext } from "react-router-dom";
import * as HelperFunctions from '../components/HelperFunctions';
import './Profile.css';


const MatchHistoryBox = (props) => {

    const isInitialMount = useRef(true);
    
    const [matchCountToShow, setMatchCountToShow] = useState(10);
    const historyBoxContainerRef = useRef();
    const [navigate, setNavigate] = useState();

    function handleMatchElementDivClick(key){
        setNavigate(key);
    }

    function handleScroll(){
        if(historyBoxContainerRef.current.scrollTop + historyBoxContainerRef.current.offsetHeight +1 >= historyBoxContainerRef.current.scrollHeight){
            setMatchCountToShow(old => old+10);
        }
    }

    function handleResize(){
        if(historyBoxContainerRef.current.scrollHeight <= historyBoxContainerRef.current.clientHeight
            && props.profileInfo.matches.length > matchCountToShow){
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
            if(navigate===undefined) handleResize();
        }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
            historyBoxContainerRef.current?.removeEventListener('scroll',handleScroll);
            window.removeEventListener('resize', handleResize);
        }
    },[]);

    let matchElements = [];

    let matchCount = props.profileInfo.matches.length;
    if(matchCount === 0) matchElements.push(<p key={-1}>You haven't played a match yet.</p>);
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

    if(navigate!==undefined){
        return(<Navigate to={'/replay/'+navigate} />);
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

    const outletContext = useOutletContext();
    const setUnreadMessage = outletContext.setUnreadMessage;
    const unreadMessage = outletContext.unreadMessage;

    function reRenderComponent(){
        setForceRender((old) => {
            if(old === 100) return 0;
            else return old+1;
        })
    }

    function userDivOnclick(event, key){
        
        setMessageBoxNav(key);
        let index = sendersAndMessages.current.findIndex(item => item.sender === key);  

        // Let the server know that i read the unread messages

        let toSend = {};
        toSend.messageIDs = [];

        // Put the read messages into toSend.messageIDs
        for(let i=sendersAndMessages.current[index].messages.length-1; i >= 0; i--){
            let holdMsg = sendersAndMessages.current[index].messages[i];
            if (holdMsg.isRead === true && holdMsg.sender !== props.profileInfo.username) break;
            else toSend.messageIDs.push(holdMsg._id);
        }

        // Update the initialUnsortedMessages
        for(let i=0; i < initialUnsortedMessages.current.length; i++){
            for(let msgId in toSend.messageIDs){
                if(initialUnsortedMessages.current[i]._id === toSend.messageIDs[msgId]) {
                    initialUnsortedMessages.current[i].isRead = true;
                }
            }
        }

        // Remove the notification if there are no more unread messages
        let removeNotification = true;
        for(let i = 0; (i < sendersAndMessages.current.length && removeNotification); i++){
            if(i === index) continue;
            for(let j = sendersAndMessages.current[i].messages.length -1 ; j >= 0; j--){
                let holdMsg = sendersAndMessages.current[i].messages[j];
                if(holdMsg.sender !== props.profileInfo.username && holdMsg.isRead === false) {
                    removeNotification = false;
                    break;
                }
            }
        }
        if(removeNotification) setUnreadMessage();

        HelperFunctions.ajax('/message/read','POST',() => {},toSend);

    }

    useEffect(() => {props.getAndSetProfile();},[unreadMessage]);

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
            if(array.length === 1) {
                if(props.profileInfo.username === array[0].messages.at(-1).sender) array[0].messages.at(-1).isRead = true;
            }
            else{
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
                let isRead = true;
                for(let i=user.messages.length-1; i>=0; i--){
                    if(user.messages[i].sender === user.sender && user.messages[i].isRead === false) isRead = false; 
                }
                
                let date = HelperFunctions.epochToDate(lastMessage.date);
                return(
                <div key={user.sender}
                onClick={(event) => userDivOnclick(event,user.sender)}
                className='profile-messagebox-user'
                style={{backgroundColor: (!isRead ? 'rgb(115 118 134)' : 'rgb(120 115 115)')}}>
                    <p>{user.sender}</p>
                    <p>{date}</p>
                </div>
                );
            });
    
    
            messagesBoxInner = messageboxUsers;
            if(messagesBoxInner.length === 0) messagesBoxInner = <p>You have no messages :(</p>

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
                <textarea
                disabled={(props.profileInfo.bans.message > new Date().getTime() ? true : false)}
                placeholder={(props.profileInfo.bans.message > new Date().getTime() ? 'banned until '+ HelperFunctions.epochToDate(props.profileInfo.bans.message) : "message...")}
                ref={replyTextArea}
                maxLength="250"
                ></textarea>
                <button 
                disabled={(props.profileInfo.bans.message > new Date().getTime() ? true : false)}
                onClick={handleReplyBtn} ref={replyBtn}>reply</button>
            </div>
            }
        </div>;


    } else{

        elementToRender = 
        <div className='profile-sendmessage-container'>
            <p>Send a message</p>
            <textarea 
            disabled={(props.profileInfo.bans.message > new Date().getTime() ? true : false)}
            placeholder={(props.profileInfo.bans.message > new Date().getTime() ? 'banned until '+ HelperFunctions.epochToDate(props.profileInfo.bans.message) : "your message...")}
            maxLength="250" ref={messageTextareaRef}></textarea>
            <button 
            disabled={(props.profileInfo.bans.message > new Date().getTime() ? true : false)}
            onClick={handleSendMsgBtn} ref={sendMessageBtnRef} >send message</button>
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
    const reportPopupRef = useRef();

    let location = useLocation();

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

    function handleReportBtn(){
        reportPopupRef.current.style.visibility="visible";

        console.log('im reporting you to the polaayiicee');


    }

    function getAndSetProfile(){
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
    }

    useEffect(() => {
        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;

            getAndSetProfile();

        } else {
            // ComponentDidUpdate
            let profileName = location.pathname.substr(location.pathname.lastIndexOf('/')+1);
            if(profileInfo !== undefined && profileName !== profileInfo.username) getAndSetProfile();
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

                <div 
                ref={reportPopupRef}
                className='profile-report-popup-container'>
                    <p>User's biography is reported</p>
                    <button onClick={() => reportPopupRef.current.style.visibility="hidden"}>OK</button>
                </div>

                <div className='profile-bio-container'>
                    <h2>{profileInfo.username}</h2>
                    {!profileInfo.userIsMe && <button className='profile-bio-report-btn' onClick={handleReportBtn}></button>}
                    <div>
                        {isEditing ? <textarea ref={bioTextareaRef} defaultValue={profileInfo.bio}></textarea> : <p>{profileInfo.bio}</p>}
                    </div>
                    {profileInfo.userIsMe && (profileInfo.bans?.message > new Date().getTime() ? <p>You are banned until {HelperFunctions.epochToDate(profileInfo.bans.message)}, can't edit biography.</p> : <button onClick={handleEditBtn}>{(isEditing === false ? 'Edit' : 'Save')}</button>)}
                </div>
                <div className='profile-bottom-container'>
                    <div className='profile-messages-container'>
                        <MessagesBox profileInfo={profileInfo} getAndSetProfile={getAndSetProfile}/>
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