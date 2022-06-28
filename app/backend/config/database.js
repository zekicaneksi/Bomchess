const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

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

module.exports = dbConnect;