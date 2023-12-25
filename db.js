const mongoose = require("mongoose");

function connectDB() {
  mongoose.connect(
    "mongodb+srv://harshil03:harshil_03@cluster0.wux2vfy.mongodb.net/",
    { useUnifiedTopology: true, useNewUrlParser: true }
  );

  const connection = mongoose.connection;
  connection.on("connected", () => {
    console.log("DB connection successfull");
  });
  connection.on("error", () => {
    console.log("DB connection Error");
  });
}

connectDB();
module.exports = mongoose;
