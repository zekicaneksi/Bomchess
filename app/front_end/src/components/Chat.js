import React, {useEffect, useRef} from 'react';
import * as HelperFunctions from './HelperFunctions.js';
import './Chat.css';

const Chat = (props) => {

    const isMounted = useRef();
    const messagesRef = useRef(null);
    const inputRef = useRef(null);

    const enableAutoScroll = useRef(true);
    const holdScrollValue = useRef(0);

    useEffect(() => {
    if (!isMounted.current) {
        // ComponentDidMount
        isMounted.current = true;
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

    const MessageItems = props.Messages.map((message,index) =>
    <p key={index}>{message}</p>
    );

    return(
        <div className="chat">

            <div className='chat-messages' ref={messagesRef}>
                {MessageItems}
            </div>

            <div className='chat-input'>
                <input ref={inputRef}></input>
                {!(props.banDate > new Date().getTime()) && <button onClick={() => {props.handleSendMessage(inputRef.current.value); inputRef.current.value='';}}>Send</button>}
            </div>

        </div>
    );

};

export default Chat;