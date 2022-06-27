require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("./model/user");
const auth = require("./middleware/auth");
const cookieParser = require('cookie-parser');


const app = express();

app.use(express.json());
app.use(cookieParser());

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
        });
    
        // Create token
        const token = jwt.sign(
          { id:user.id,
            email:user.email,
            username:user.username,
            bans:{playing:user.bans.playing,
                chat:user.bans.chat,
                message:user.bans.message}
            },
            process.env.TOKEN_KEY/*,
            {
              expiresIn: process.env.jwtExp + "d",
            }*/
        );
    
        return res.status(201).cookie("access_token",token, {httpOnly: true}).send();
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
    
        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
            { id:user.id,
              email:user.email,
              username:user.username,
              bans:{playing:user.bans.playing,
                  chat:user.bans.chat,
                  message:user.bans.message}
              },
              process.env.TOKEN_KEY/*,
              {
                expiresIn: process.env.jwtExp + "d",
              }*/
          );
    
          return res.status(200).cookie("access_token",token, {httpOnly: true}).send();
        }
        return res.status(400).send("invalid");
    } catch (err) {
    return res.status(400).send("error, could not process");
    }
});

app.get("/api/test", auth, async (req, res) => {
  if(res.locals.token == "valid"){
    return res.status(200).send("valid token");
  }else{
    return res.status(200).cookie("access_token","", {httpOnly: true}).send("invalid token");
  }
});


module.exports = app;