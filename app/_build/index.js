const express = require('express');
const path = require('path');
var proxy = require('express-http-proxy');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', proxy('localhost:4001', {
    proxyReqPathResolver: function (req) {
	return '/api'+ req.url;}
    }));

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {console.log('listening on port:3000')});