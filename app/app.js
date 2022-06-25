require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./model/user");

const app = express();

app.use(express.json());

// Check existence of email
app.post("/checkEmail", async (req, res) => {

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


module.exports = app;