const mongoose = require("mongoose");

const idSchema = new mongoose.Schema({
  identification_number: { type: String },
  name: { type: String },
  last_name: { type: String },
  date_of_birth: { type: String },
  date_of_issue: { type: String },
  date_of_expiry: { type: String },
});

const idModel = mongoose.model("id", idSchema);
module.exports = idModel;
