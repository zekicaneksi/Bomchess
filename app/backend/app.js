require("dotenv").config();
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dbConnect = require("./config/database");
const bcrypt = require("bcryptjs");
const User = require("./model/user");
const Session = require("./model/session");
const auth = require('./middleware/auth');
const mongoose = require("mongoose");


const app = express();

const sessionConfig = session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: dbConnect,
    collectionName: "sessions",
    stringify: false,
    autoRemove: 'interval',
    autoRemoveInterval: 1
  })
});

app.use(sessionConfig);

app.use(express.json());

// Check existence of email
app.post("/api/checkEmail", async (req, res) => {

    const {email} = req.body;
    // Validate input
    if (!email) {
      return res.status(400).send();  
    }

    // Check if email exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
        return res.status(200).send("exists");
    }
    else{
        return res.status(200).send("none");
    }

});

// Register
app.post("/api/register", async (req, res) => {
    try {
        // Get user input
        const {username, password, email} = req.body;
    
        // Validate user input
        if (!(username && password && email)) {
          return res.status(400).send();
        }

        // Check if email already exist
        let oldUser = await User.findOne({ email });
        if (oldUser) {
          return res.status(409).send('email');
        }
        
        // Check if username already exists
        oldUser = await User.findOne({ username });
        if(oldUser){
          return res.status(409).send('username');
        }

        // Create the user
        encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
          username,
          password,
          email: email.toLowerCase(),
          password: encryptedPassword,
          bio: "hello, i am " + username + "!"
        });

        // redirect to login
        return res.redirect(308, 'login');
      
    } catch (err) {
      return res.status(500).send();
    }
});

// Login
app.post("/api/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
          return res.status(400).send();
        }

        // Validate if user exist in our database
        const user = await User.findOne({ email });
        const uId = user._id.toString();

        // Check credentials
        if (user && (await bcrypt.compare(password, user.password))) {

          // Check if user is already logged in
          if( await Session.findOne({ 'session.userID' : uId }) != null){
            await Session.deleteOne({ 'session.userID' : uId });
          }

          // Login succssful
          req.session.userID = user._id.toString();
          return res.status(200).send();
        }
        // Invalid credentials 
        else{
          return res.status(400).send();
        }
    } catch (err) {
      return res.status(500).send();
    }
});

app.get('/api/logout', async (req, res) => {
  req.session.destroy();
  return res.status(200).clearCookie('connect.sid').send();
});

app.get("/api/checkSession", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id' : id });
  return res.status(200).send({username : user.username});
});


module.exports = app;

module.exports = {
  app: app,
  sessionConfig: sessionConfig
};