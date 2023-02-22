
import * as dotenv from "dotenv";
import express from "express";
import URL from 'node:url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { dbConnect } from "./config/database.js";
import bcrypt from "bcryptjs";
import { User } from "./model/user.js";
import { Match } from "./model/match.js"
import { Report } from "./model/report.js";
import { Message } from "./model/message.js"
import { Session } from "./model/session.js";
import { auth } from './middleware/auth.js';
import mongoose from "mongoose";
import cors from "cors";
import { google } from 'googleapis';
import fs from 'fs';
import { promisify } from 'node:util';
const google_cred = JSON.parse(fs.readFileSync('./google_login.json'));

import { Games } from './websocketservers/Share.js';
import { newMessage } from './websocketservers/WSSLayout.js';
import { createRequire } from "node:module";

const config = dotenv.config().parsed;
const app = express();

// Generating google auth url
const oauth2Client = new google.auth.OAuth2(
  google_cred.web.client_id,
  google_cred.web.client_secret,
  google_cred.web.redirect_uris[0]
);

const scopes = [
  'https://www.googleapis.com/auth/userinfo.email',
];

const google_auth_url = oauth2Client.generateAuthUrl({
  scope: scopes
});
// -- Generating google auth url

const sessionConfig = session({
  secret: config.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    clientPromise: dbConnect,
    collectionName: "sessions",
    stringify: false,
    autoRemove: 'interval',
    autoRemoveInterval: 1,
  })
});

app.use(sessionConfig);

app.use(express.json());

app.options('*', cors({
  credentials: true,
  methods: '*',
  origin: config.FRONT_END_ADDRESS
})) // include before other routes

app.use(cors({
  allowedHeaders: '*',
  credentials: true,
  methods: '*',
  origin: config.FRONT_END_ADDRESS
}))

/*
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", config.FRONT_END_ADDRESS);
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});*/

// Check existence of email
app.post("/api/checkEmail", async (req, res) => {

  const { email } = req.body;
  // Validate input
  if (!email) {
    return res.status(400).send();
  }

  // Check if email exists
  const oldUser = await User.findOne({ email });
  if (oldUser && oldUser.password=='') {
    return res.status(200).send("googleLogin");
  }
  else if (oldUser) {
    return res.status(200).send("exists");
  }
  else {
    return res.status(200).send("none");
  }

});

// Register
app.post("/api/register", async (req, res) => {
  try {
    // Get user input
    const { username, password, email } = req.body;

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
    if (oldUser) {
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
      if (await Session.findOne({ 'session.userID': uId }) != null) {
        await Session.deleteOne({ 'session.userID': uId });
      }

      // Login succssful
      req.session.userID = user._id.toString();
      return res.status(200).send();
    }
    // Invalid credentials 
    else {
      return res.status(400).send();
    }
  } catch (err) {
    return res.status(500).send();
  }
});

app.get('/api/get-google-login-url', async (req, res) => {
  return res.status(200).send(google_auth_url);
});

app.get('/api/login-via-google', async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    const email = (await oauth2Client.getTokenInfo(tokens.access_token)).email;
    const user = await User.findOne({ email });

    // If user isn't registered, register
    if (!user) {
      const createdUser = await User.create({
        username: '',
        password: '',
        email: email,
        bio: ""
      });
      req.session.userID = createdUser._id.toString();
    } else {
      const uId = user._id.toString();
      // Check if user is already logged in
      if (await Session.findOne({ 'session.userID': uId }) != null) {
        await Session.deleteOne({ 'session.userID': uId });
        await promisify(req.session.regenerate.bind(req.session))();
      };
      req.session.userID = user._id.toString();
    }

    // If user is registered but hasn't set an username
    if (!user || user.username == '')
      return res.redirect(config.FRONT_END_ADDRESS + '/login-via-google');
    else  // Login the user
      return res.redirect(config.FRONT_END_ADDRESS + '/');

  } catch (error) {
    console.log(error);
    return res.redirect(config.FRONT_END_ADDRESS + '/');
  }
});

app.get('/api/checkGoogleSession', async (req, res) => {
  if(req.session.userID == undefined){
    return res.status(401).send();
  } else {
    let id = mongoose.Types.ObjectId(req.session.userID);
    const user = await User.findOne({ '_id': id });
    if(user.username != '') return res.status(401).send();
    return res.status(200).send();
  }
});

app.post('/api/set-google-username', async (req, res) => {
  try {
    let id = mongoose.Types.ObjectId(req.session.userID);
    const user = await User.findOne({ '_id': id });
    if(user.username!= '') return res.status(200).send();

    const checkUsername = await User.findOne({'username': req.body.username});
    if(checkUsername) return res.status(406).send();
    else {
      await user.updateOne({'username': req.body.username, "bio": "hello, i am " + req.body.username + "!"});
      return res.status(200).send();
    }

  } catch (error) {
    console.log(error);
    return res.status(400).send();
  }
});

app.get('/api/logout', async (req, res) => {
  req.session.destroy();
  return res.status(200).clearCookie('connect.sid').send();
});

app.get("/api/checkSession", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id': id });

  let toSend = {
    username: user.username,
    hasGame: "no",
    bans: user.bans,
    type: user.type
  }

  // Check if the player already has a game going on
  try { // In try block because WSSGame may be deleted while foreach is working.
    Games.forEach(wssGame => {

      if (wssGame.initialData.players.includes(id.toString())) {
        toSend.hasGame = "yes";
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

  let id = mongoose.Types.ObjectId(req.session.userID);
  const requestingUser = await User.findOne({ '_id': id });

  const myUrl = new URL.parse(req.url, true);
  const username = myUrl.query.username;

  const user = await User.findOne({ 'username': username });

  if (user === null) return res.status(404).send();

  const matches = await Match.find({ $or: [{ white: user._id }, { black: user._id }] });
  let usernamesInMatches = new Map();

  // Get the usernames for matches
  for (const match in matches) {
    if (!usernamesInMatches.get(matches[match].black.toString())) {
      let holdUser = await User.findOne({ '_id': matches[match].black });
      usernamesInMatches.set(holdUser._id.toString(), holdUser.username);
    }
    if (!usernamesInMatches.get(matches[match].white.toString())) {
      let holdUser = await User.findOne({ '_id': matches[match].white });
      usernamesInMatches.set(holdUser._id.toString(), holdUser.username);
    }
  }

  let toSend = {};
  toSend.userIsMe = (req.session.userID === user._id.toString());
  toSend.username = user.username;
  toSend.bio = user.bio;
  toSend.matches = [];
  toSend.messages = [];

  toSend.bans = requestingUser.bans;

  matches.forEach(match => {
    toSend.matches.push({
      id: match._id.toString(),
      date: match.date,
      length: match.length,
      white: usernamesInMatches.get(match.white.toString()),
      black: usernamesInMatches.get(match.black.toString()),
      endedBy: match.endedBy,
      winner: match.winner
    })
  });

  // Send the private messages as well if the user is visiting his own profile page
  if (toSend.userIsMe) {
    const messages = await Message.find({ $or: [{ 'receiver': user.username }, { 'sender': user.username }] });
    for (const message in messages) {
      toSend.messages.push(messages[message]);
    }
  }

  return res.status(200).send(JSON.stringify(toSend));

});

app.post("/api/bio", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id': id });

  if (user.bans.message > new Date().getTime()) return res.status(403).send();

  await User.findOneAndUpdate({ '_id': id }, { 'bio': req.body.bio });

  return res.status(200).send();

});

app.post("/api/message", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id': id });

  if (user.bans.message > new Date().getTime()) return res.status(403).send();

  const receiver = await User.findOne({ 'username': req.body.receiver });

  if (user === receiver) return res.status(406).send();
  // If the receiver is not found, return 404
  if (!(receiver)) return res.status(404).send();

  const message = await Message.create({
    sender: user.username,
    receiver: receiver.username,
    content: req.body.message,
    date: new Date().getTime(),
    isRead: false
  });

  newMessage(receiver.username);

  return res.status(200).send(JSON.stringify(message));

});

app.post("/api/message/read", auth, async (req, res) => {
  let id = mongoose.Types.ObjectId(req.session.userID);
  const user = await User.findOne({ '_id': id });

  for (let i = 0; i < req.body.messageIDs.length; i++) {
    req.body.messageIDs[i] = mongoose.Types.ObjectId(req.body.messageIDs[i]);
  }

  await Message.updateMany({ '_id': { $in: req.body.messageIDs }, 'sender': { $ne: user.username } }, { $set: { 'isRead': true } });

  return res.status(200).send();

});

app.get("/api/replay", auth, async (req, res) => {

  const myUrl = new URL.parse(req.url, true);
  let matchId;

  try {
    matchId = mongoose.Types.ObjectId(myUrl.query.matchId);
  } catch (error) {
    return res.status(404).send();
  }

  const match = await Match.findOne({ '_id': mongoose.Types.ObjectId(matchId) });

  if (match === null) return res.status(404).send();

  let toSend = {};
  toSend.id = match._id.toString();
  toSend.white = (await User.findOne({ '_id': match.white })).username;
  toSend.black = (await User.findOne({ '_id': match.black })).username;
  toSend.moves = match.moves;
  toSend.length = match.length;
  toSend.date = match.date;
  toSend.endedBy = match.endedBy;
  toSend.winner = match.winner;

  return res.status(200).send(JSON.stringify(toSend));

});

app.get("/api/admin/tabsInfo", auth, async (req, res) => {
  let toSend = {
    AllUsers: [],
    ReportedUsers: [],
    ReportedMessages: undefined,
    ReportedMatches: undefined
  };

  // -- All Users

  const users = await User.find();

  for (const user in users) {
    toSend.AllUsers.push({
      id: users[user]._id.toString(),
      username: users[user].username,
      email: users[user].email,
      type: users[user].type,
      bans: users[user].bans
    });
  }


  async function getReports(type) {

    let toReturn = [];

    const reports = await Report.find({ "type": type });

    for (const report in reports) {
      let toPush = {};

      toPush.id = reports[report]._id.toString();
      toPush.sourceUsername = reports[report].sourceUsername;
      toPush.targetUsername = reports[report].targetUsername;
      toPush.targetID = reports[report].targetID;

      if (type === 'game') {
        const sourceUser = await User.findOne({ "username": reports[report].sourceUsername });
        const targetUser = await User.findOne({ "username": reports[report].targetUsername });
        const filterArray = [sourceUser._id, targetUser._id];
        const match = await Match.findOne({ "date": reports[report].content, $in: ["white", filterArray], $in: ["black", filterArray] });
        if (match === null) continue;
        toPush.content = match._id.toString();
      } else {
        toPush.content = reports[report].content;
      }

      toReturn.push(toPush);
    }

    return [...toReturn];
  }

  toSend.ReportedUsers = await getReports("bio");
  toSend.ReportedMessages = await getReports("chat");
  toSend.ReportedMatches = await getReports("game");

  return res.status(200).send(JSON.stringify(toSend));
});

app.post("/api/admin/ban", auth, async (req, res) => {

  const banType = req.body.banType;
  const banLength = parseInt(req.body.banLength);
  const userID = req.body.userID;

  const banTypes = ['playing', 'message', 'chat'];
  const banLengths = [7, 15, 30];

  // Checking the values
  if (!(banTypes.includes(banType)) || !(banLengths.includes(banLength))) return res.status(400).send();

  // Check if user exists
  const user = await User.findOne({ '_id': mongoose.Types.ObjectId(userID) });
  if (user === null) return res.status(400).send();

  // Ban the user
  let currentDate = new Date();
  let banDate = new Date(currentDate.setDate(currentDate.getDate() + banLength));
  user.bans[banType] = banDate.getTime();

  if (banType === 'message') user.bio = " ";

  await user.save();
  return res.status(200).send();
});

app.post("/api/report", auth, async (req, res) => {

  const reportTypes = ["bio", "chat", "game"];

  // Check report type
  if (!(reportTypes.includes(req.body.type))) return res.status(400).send();

  const sourceUser = await User.findOne({ 'username': req.body.sourceUsername });
  const targetUser = await User.findOne({ 'username': req.body.targetUsername });
  if (sourceUser === null || targetUser === null) return res.status(400).send();

  if (req.body.type === "chat") {
    let toSet = '';
    for (let msg in req.body.content) {
      toSet += "\n" + req.body.content[msg];
    }
    req.body.content = toSet;
  }

  try {
    const report = await Report.create({
      type: req.body.type,
      sourceUsername: sourceUser.username,
      targetUsername: targetUser.username,
      targetID: targetUser._id.toString(),
      content: req.body.content
    });
    return res.status(200).send();
  } catch (error) {
    return res.status(400).send();
  }

});

app.post("/api/admin/resolveReport", auth, async (req, res) => {

  await Report.findOneAndDelete({ '_id': mongoose.Types.ObjectId(req.body.id) });

  return res.status(200).send();

});

export { app, sessionConfig };