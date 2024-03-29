const mongoose = require("mongoose");

// Define Schema
const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: "user",
  },
});

// Compile model from schema
const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
