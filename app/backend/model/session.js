const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  session:{
    userID: {type: String}
  }
});

module.exports = mongoose.model("session", sessionSchema, 'sessions');