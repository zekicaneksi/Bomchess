import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  session:{
    userID: {type: String}
  }
});

const Session = mongoose.model("session", sessionSchema, 'sessions');
export {Session};