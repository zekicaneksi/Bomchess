import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    id:{type: mongoose.Schema.ObjectId},
  username: { type: String, maxLength:15 },
  email: { type: String, maxLength:100},
  password: { type: String, maxLength:150 },
  bio:{type: String, maxLength:1000},
  bans:{
    playing:{type:Number, default:"0.1"},
    chat:{type:Number, default:"0.1"},
    message:{type:Number, default:"0.1"}
  },
  type:{type:String, default:"normal"}
});

const User = mongoose.model("user", userSchema, 'users'); 
export {User};