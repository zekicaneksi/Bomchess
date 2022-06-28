require("dotenv").config();
const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dbConnect = require("./config/database");
const bcrypt = require("bcryptjs");
const User = require("./model/user");
const Session = require("./model/session");


const app = express();

app.use(session({
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
}));

app.use(express.json());

// Check existence of email
app.post("/api/checkEmail", async (req, res) => {

    const {email} = req.body;
    if (!email) {
        res.status(400).send("Email empty!");
        return;
    }

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
          res.status(400).send("All input is required");
          return;
        }
    
        // check if user already exist
        const oldUser = await User.findOne({ email });
    
        if (oldUser) {
          return res.status(409).send("User Already Exist. Please Login");
        }
    
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
        // Create user in our database
        const user = await User.create({
          username,
          password,
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          password: encryptedPassword,
          bio: "hello, i am " + username + "!"
        });
    
        req.session.userID = user._id.toString();
        return res.status(201).send("success");
    } catch (err) {
    return res.status(400).send("error, could not create");
    }
});

// Login
app.post("/api/login", async (req, res) => {
    try {
        // Get user input
        const { email, password } = req.body;
    
        // Validate user input
        if (!(email && password)) {
          res.status(400).send("All input is required");
          return;
        }
        // Validate if user exist in our database
        const user = await User.findOne({ email });
        const uId = user._id.toString();
        if (user && (await bcrypt.compare(password, user.password))) {

          if(await Session.findOne({ 'session.userID' : uId }) != null){
            return res.status(400).send('user already logged in');
          }
          req.session.userID = user._id.toString();
          return res.status(200).send("login successful");
        }
        return res.status(400).send("invalid credenticals");
    } catch (err) {
    return res.status(400).send("error, can't login");
    }
});

app.get('/api/logout', async (req, res) => {
  req.session.destroy();
  return res.clearCookie('connect.sid').status(200).send('logged out');
});

app.get("/api/test", async (req, res) => {
 return res.status(200).send("hello your id is: "+req.session.userID +"<br> and you session id:" + req.sessionID);
});


module.exports = app;