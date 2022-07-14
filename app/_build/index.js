const express = require('express');
const path = require('path');
var proxy = require('express-http-proxy');
require('dotenv').config()
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', proxy('localhost:'+process.env.BACKEND_PORT, {
    proxyReqPathResolver: function (req) {
	return '/api'+ req.url;}
    }));

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.FRONT_END_PORT, () => {console.log('listening on port:'+process.env.FRONT_END_PORT)});