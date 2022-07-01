const ws = require("ws");
const parse = require("url").parse;
const sessionConfig = require("./app").sessionConfig;
const mongoose = require("mongoose");
const User = require("./model/user");

const wssLobby = new ws.WebSocketServer({ noServer: true });

wssLobby.on('connection', function connection(ws,req) {

    //console.log(req.headers.cookie)
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something from ws 1');
});

const upgrade = async (request, socket, head) => {

  sessionConfig(request, {}, async () => {

    // Check if user has a session
    if(request.session.userID == undefined){
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    // Get the user
    const user = await User.findOne({'_id' : mongoose.Types.ObjectId(request.session.userID)});

    const { pathname } = parse(request.url);

    if (pathname === '/api/lobby') {
      //Check if user has a ban on chat
      if(user.bans.chat == true){
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      // Connect the user
      wssLobby.handleUpgrade(request, socket, head, function done(ws) {
        wssLobby.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }

  });


}

module.exports = upgrade;