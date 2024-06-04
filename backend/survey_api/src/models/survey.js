// models/survey.js
const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  title: String,
  description: String,
  googleFormId: String,
  responses: Array, // Store responses here or create a separate collection
  userId: String, // Reference to user ID from CRM
});

module.exports = mongoose.model("Survey", surveySchema);
