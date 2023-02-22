import mongoose from "mongoose";
import * as dotenv from "dotenv";

const config = dotenv.config().parsed;

const MONGO_URI  = config.MONGO_URI;

console.log('connecting to database...');
const dbConnect = 
  // Connecting to the database
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then((m) => {
      console.log("Successfully connected to database");
      return m.connection.getClient();
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      process.exit(1);
    });

export {dbConnect};
