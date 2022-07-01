const ws = require("ws");
const parse = require("url").parse;
const sessionConfig = require("./app").sessionConfig;

const wssLobby = new ws.WebSocketServer({ noServer: true });

wssLobby.on('connection', function connection(ws,req) {

    //console.log(req.headers.cookie)
    ws.on('message', function message(data) {
        console.log('received: %s', data);
    });

    ws.send('something from ws 1');
});

const upgrade = (request, socket, head) => {

  // here, check session info and stuff, and if incorrect, terminate the connection.
  sessionConfig(request, {}, () => {
    console.log(request.session.userID);

    

  });

  const { pathname } = parse(request.url);

  if (pathname === '/api/lobby') {
      wssLobby.handleUpgrade(request, socket, head, function done(ws) {
      wssLobby.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
}

module.exports = upgrade;