const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account", // Assuming you have a User model
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestampCreated: {
    type: Date,
    default: Date.now, // Timestamp when the notification was created
  },
  timestampSent: {
    type: Date, // Timestamp when the notification was sent
  },
  sent: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Contact", contactSchema);
