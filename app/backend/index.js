const http = require("http");
const app = require("./app").app;
const upgrade = require("./websocket");

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

const server = http.createServer(app);
server.on('upgrade', upgrade);

// server listening 
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});