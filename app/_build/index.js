const express = require('express');
const path = require('path');
require('dotenv').config()
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/*', function (req, res) {
   res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(process.env.FRONT_END_PORT, () => {console.log('listening on port:'+process.env.FRONT_END_PORT)});