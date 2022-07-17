import React, {useEffect, useRef} from 'react';
import './Chat.css';

const Chat = (props) => {

    const isMounted = useRef();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
    if (!isMounted.current) {
        // ComponentDidMount
        isMounted.current = true;
    } else {
        // ComponentDidUpdate
        messagesEndRef.current?.scrollTo({ top: messagesEndRef.current.scrollHeight, left:0, behavior: 'smooth'});
    }
    });

    const MessageItems = props.Messages.map((message,index) =>
    <p key={index}>{message}</p>
    );

    return(
        <div className="lobby-chat">

            <div className='lobby-chat-messages' ref={messagesEndRef}>
                {MessageItems}
            </div>

            <div className='lobby-chat-input'>
                <input ref={inputRef}></input>
                <button onClick={() => {props.handleSendMessage(inputRef.current.value);}}>Send</button>
            </div>

        </div>
    );

};

export default Chat;