import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
    id:{type: mongoose.Schema.ObjectId},
  date: { type: Number },
  length:{type: String},
  white: { type: mongoose.Schema.ObjectId},
  black: { type: mongoose.Schema.ObjectId },
  moves: { type: Array },
  endedBy: { type: String},
  winner: { type: String},
});

const Match = mongoose.model("match", matchSchema, 'matches'); 
export {Match};