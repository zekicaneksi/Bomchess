const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    id:{type: mongoose.Schema.ObjectId},
  username: { type: String, maxLength:15 },
  email: { type: String, maxLength:100},
  password: { type: String, maxLength:100 },
  bio:{type: String, maxLength:1000},
  bans:{
    playing:{type:Boolean, default:"no"},
    chat:{type:Boolean, default:"no"},
    message:{type:Boolean, default:"no"}
  },
  token: { type: String }
});

module.exports = mongoose.model("user", userSchema, 'users');