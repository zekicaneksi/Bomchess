const ws = require("ws");

let Games = require('./Share').Games;

const WSSQueue = new ws.WebSocketServer({ noServer: true });

let usersInQueue = new Map();

// Used as a response to 'ping'
function heartbeat(){
  this.isAlive = true;
}

WSSQueue.on('connection', (ws,req) => {

    // Check if there's a match in queue
    let isThereAMatch = false;
    usersInQueue.forEach((wsInList, key) => {
        if(ws.matchLength == wsInList.matchLength){
           isThereAMatch = true;
           /* 
            here, create a WSSGame and put the game in the Games array.
            -- but before creating the game, check the Games array
            and see if the users already have a game or not, beacuse
            theoritaclly they can create multiple games simultaneously --
           */
            wsInList.send('matched');
            ws.send('matched');
            wsInList.close();
            return;
        }
    });
    if(isThereAMatch) return ws.close();
    
    // If there is not a match, put the user in queue
    usersInQueue.set(req.session.id,ws);

    // On socket close, remove from the list.
    ws.on('close', () => {
        usersInQueue.delete(req.session.id);
    });

    // Ping-pong messages to keep the connection active
    ws.isAlive = true;
    ws.on('pong', heartbeat);

});

// Ping-pong messages to detect and close broken connections
const interval = setInterval( () => {

    WSSQueue.clients.forEach( (ws) => {
    if (ws.isAlive === false) {
        return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
    });

}, 10000);

WSSQueue.on('close', function close() {
    clearInterval(interval);
});

module.exports = WSSQueue;