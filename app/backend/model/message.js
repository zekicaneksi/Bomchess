import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    id:{type: mongoose.Schema.ObjectId},
  sender: { type: String },
  receiver: { type: String},
  content: { type: String, maxLength:250 },
  date:{type: Number},
  isRead: {type: Boolean}
});

const Message = mongoose.model("message", messageSchema, 'privateMessages'); 
export {Message};