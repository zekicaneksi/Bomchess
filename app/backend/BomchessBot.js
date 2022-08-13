import WebSocket from 'ws';
import {WSSLobby} from './websocketservers/WSSLobby.js';
import {User} from "./model/user.js";
import {Message} from "./model/message.js"
import { newMessage } from './websocketservers/WSSLayout.js';

const { API_PORT } = process.env;

const email = "bot@bomchess.com";
const username = "BomchessBot";

const BomchessBot = async () => {

    let socket = new WebSocket('ws://localhost:'+ API_PORT + '/api/layout');

    socket.addEventListener('error', function (event) {});

    const user = await User.findOne({"email" : email});
    socket.user = user;
    WSSLobby.clients.add(socket);
    

    let isChecking = false;
    async function checkForMessages(){
        if(isChecking) return;
        else isChecking = true;

        const messages = await Message.find({"receiver" : username, "isRead" : false});
        await Message.updateMany({"receiver" : username, "isRead" : false}, {"isRead" : true});
        for(const msg in messages){
            
            let backContent = [...messages[msg].content].reverse().join("");

            await Message.create({
                sender: username,
                receiver: messages[msg].sender,
                content: backContent,
                date: new Date().getTime(),
                isRead: false
            });

            newMessage(messages[msg].sender);
        }

        isChecking = false;
    }

    setInterval(checkForMessages,5000);
}

export {BomchessBot};