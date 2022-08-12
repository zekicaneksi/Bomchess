import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    id:{type: mongoose.Schema.ObjectId},
  type: { type: String },
  content: { type: String, maxLength:1000},
  sourceUsername: {type: String},
  targetUsername: {type: String},
  targetID: {type: String}
});

const Report = mongoose.model("report", reportSchema, 'reports'); 
export {Report};