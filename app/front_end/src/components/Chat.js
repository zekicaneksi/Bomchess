import React, {useEffect, useRef} from 'react';
import * as HelperFunctions from './HelperFunctions.js';
import './Chat.css';

const Chat = (props) => {

    const isMounted = useRef();
    const messagesRef = useRef(null);
    const inputRef = useRef(null);

    const enableAutoScroll = useRef(true);
    const holdScrollValue = useRef(0);
    
    function handleSendMessage(){
        if(props.handleSendMessage(inputRef.current.value)){
            inputRef.current.disabled = true;
            inputRef.current.value = "Please use only one tab";
            return;
        }
        inputRef.current.value='';
    }

    function keyPress(event){
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    }

    useEffect(() => {
    if (!isMounted.current) {
        // ComponentDidMount
        isMounted.current = true;

        inputRef.current.addEventListener("keypress", keyPress);

        if(props.banDate > new Date().getTime()){
            inputRef.current.disabled=true;
            inputRef.current.placeholder="You are banned until " + HelperFunctions.epochToDate(props.banDate);
        }
    } else {
        // ComponentDidUpdate

        // If user scrolled up, disable auto scroll
        if(holdScrollValue.current > messagesRef.current.scrollTop)
            enableAutoScroll.current = false;
        
        // Enable auto scroll if user scrolled to bottom
        if((messagesRef.current.scrollTop + messagesRef.current.offsetHeight + 2) >= messagesRef.current.scrollHeight)
            enableAutoScroll.current = true;
        
        if(enableAutoScroll.current){
            messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, left:0, behavior: 'smooth'});
            holdScrollValue.current = messagesRef.current.scrollTop;
        }
    }
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
            inputRef.current?.removeEventListener('keypress', keyPress);
        }
    },[]);

    const MessageItems = props.Messages.map((message,index) => {
        let indexSeperator = message.indexOf(':');
        let username = message.substr(0,indexSeperator);
        let msg = message.substr(indexSeperator+1);
        return(<div key={index}>
            <a href={"/profile/"+username} target={'_blank'}>{username}:</a>
            <p> {msg}</p>
        </div>);
    }
    );

    return(
        <div className="chat">

            <div className='chat-messages' ref={messagesRef}>
                {MessageItems}
            </div>

            <div className='chat-input'>
                <input ref={inputRef} maxLength={100}></input>
                {!(props.banDate > new Date().getTime()) && <button onClick={handleSendMessage}>Send</button>}
            </div>

        </div>
    );

};

export default Chat;