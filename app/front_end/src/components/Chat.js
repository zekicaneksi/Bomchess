import React, {useEffect, useRef} from 'react';
import './Chat.css';

const Chat = (props) => {

    const isMounted = useRef();
    const messagesEndRef = useRef(null);

    useEffect(() => {
    if (!isMounted.current) {
        // ComponentDidMount
        isMounted.current = true;
    } else {
        // ComponentDidUpdate
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    });

    const MessageItems = props.Messages.map((message,index) =>
    <p key={index}>{message}</p>
    );

    return(
        <div id="lobby-chat">

            <div className='lobby-chat-messages'>
                {MessageItems}
                <div ref={messagesEndRef} />
            </div>

            <div className='lobby-chat-input'>
                <input></input>
                <button onClick={props.handleSendMessage}>Send</button>
            </div>

        </div>
    );

};

export default Chat;