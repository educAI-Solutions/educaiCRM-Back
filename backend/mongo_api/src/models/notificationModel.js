const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account", // Assuming you have a User model
    required: true,
  },
  type: {
    type: String,
    required: true, // Notification type (e.g. "message", "alert", "reminder")
  },
  content: {
    type: String,
    required: true,
  },
  programId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program", // Assuming you have a Program model
    },
  ],
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Assuming you have a Course model
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class", // Assuming you have a Class model
  },
  timestampCreated: {
    type: Date,
    default: Date.now, // Timestamp when the notification was created
  },
  timestampRead: {
    type: Date, // Timestamp when the notification was read
  },
  read: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
