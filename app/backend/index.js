import http from "http";
import {app}  from "./app.js";
import {upgrade} from "./websocket.js";
import {BomchessBot} from "./BomchessBot.js";

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

const server = http.createServer(app);
server.on('upgrade', upgrade);

// server listening 
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

BomchessBot();