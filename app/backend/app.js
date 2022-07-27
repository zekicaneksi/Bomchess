
import * as dotenv from "dotenv";
import express from "express";
import URL from 'node:url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import {dbConnect} from "./config/database.js";
import bcrypt from "bcryptjs";
import {User} from "./model/user.js";
import {Match} from "./model/match.js"
import {Message} from "./model/message.js"
import {Session} from "./model/session.js";
import {auth} from './middleware/auth.js';
import mongoose from "mongoose";

import {Games} from './websocketservers/Share.js';
import { createRequire } from "node:module";

const config = dotenv.config().parsed;
const app = express();

const sessionConfig = session({
  secret: config.SECRET,
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
        const encryptedPassword = await bcrypt.hash(password, 10);

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
      console.log(err);
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

  let toSend={
    username: user.username,
    hasGame: "no"
  }

  // Check if the player already has a game going on
  try { // In try block because WSSGame may be deleted while foreach is working.
      Games.forEach(wssGame => {
        
          if(wssGame.initialData.players.includes(id.toString())){
              toSend.hasGame="yes";
              return;
          }
      });    
  } catch (error) {
      console.log(error);
  }

  return res.status(200).send(JSON.stringify(toSend));

});

// Get an user's profile
app.get("/api/profile", auth, async (req, res) => {

  const myUrl = new URL.parse(req.url,true);
  const username = myUrl.query.username;

  const user = await User.findOne({ 'username' : username });

  if(user === null) return res.status(404).send();

  const matches = await Match.find({ $or: [{ white: user._id }, { black: user._id }] });
  let usernamesInMatches = new Map();

  // Get the usernames for matches
  for(const match in matches){
    if(!usernamesInMatches.get(matches[match].black.toString())){
      let holdUser = await User.findOne({'_id' : matches[match].black});
      usernamesInMatches.set(holdUser._id.toString(), holdUser.username);
    }
    if(!usernamesInMatches.get(matches[match].white.toString())){
      let holdUser = await User.findOne({'_id' : matches[match].white});
      usernamesInMatches.set(holdUser._id.toString(), holdUser.username);
    }
  }

  let toSend = {};
  toSend.userIsMe = (req.session.userID === user._id.toString());
  toSend.username = user.username;
  toSend.bio = user.bio;
  toSend.matches = [];
  toSend.messages=[];

  matches.forEach(match => {
    toSend.matches.push({
      id : match._id.toString(),
      date : match.date,
      length : match.length,
      white : usernamesInMatches.get(match.white.toString()),
      black : usernamesInMatches.get(match.black.toString()),
      endedBy : match.endedBy,
      winner : match.winner
    })
  });

  // Send the private messages as well if the user is visiting his own profile page
  if(toSend.userIsMe){
    const messages = await Message.find({ $or: [{ 'receiver' : user.username }, { 'sender': user.username }] }); 
    for(const message in messages){
      toSend.messages.push(messages[message]);
    }
  }

  return res.status(200).send(JSON.stringify(toSend));

});

app.post("/api/message", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id' : id });

  const receiver = await User.findOne({'username': req.body.receiver});
  // If the receiver is not found, return 404
  if(!(receiver)) return res.status(404).send();
  
  const message = await Message.create({
    sender: user.username,
    receiver: receiver.username,
    content: req.body.message,
    date: new Date().getTime(),
    isRead: false
  });

  return res.status(200).send();

});

app.post("/api/message/read", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id' : id });

  for(let i = 0; i < req.body.messageIDs.length; i++){
    req.body.messageIDs[i] = mongoose.Types.ObjectId(req.body.messageIDs[i]);
  }
  
  await Message.updateMany({ '_id' : {$in: req.body.messageIDs}, 'sender' : {$ne: user.username}}, { $set: { 'isRead': true } });

  return res.status(200).send();

});


export {app, sessionConfig};