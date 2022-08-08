import WebSocket, { WebSocketServer } from 'ws';
import {Message} from "../model/message.js"

const WSSLayout = new WebSocketServer({ noServer: true });

// used in app.js to let WSSLayout know that somebody sent a new message to somebody
function newMessage(receiverUsername){
    WSSLayout.clients.forEach( (ws) => {
        if (ws.user.username === receiverUsername) {
            let toSend={};
            toSend.type='newMessage';
            ws.send(JSON.stringify(toSend));
        }
    });
}

// Used as a response to 'ping'
function heartbeat(){
  this.isAlive = true;
}

WSSLayout.on('connection', async (ws,req) => {

    // Ping-pong messages to keep the connection active
    ws.isAlive = true;
    ws.on('pong', heartbeat);

    // Connection message
    let toSend = {};
    toSend.type = "connected";
    toSend.unreadMessage = 'no';

    const isRead = await Message.findOne({$and: [{ 'receiver' : ws.user.username },{ 'isRead': false }]}); 
    if(isRead !== null) toSend.unreadMessage = 'yes';
    
    ws.send(JSON.stringify(toSend));

});

// Ping-pong messages to detect and close broken connections
const interval = setInterval( () => {

    WSSLayout.clients.forEach( (ws) => {
    if (ws.isAlive === false) {
        return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
    });

}, 10000);

WSSLayout.on('close', function close() {
    clearInterval(interval);
});

export {WSSLayout, newMessage};