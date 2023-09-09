const mongoose = require("mongoose");
require("dotenv").config();
const uri = process.env.MONGO_URL;  

const connectDB = () => {
  console.log("in fun");
  return mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("connect to db");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDB;
