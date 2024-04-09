const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true }, // Assuming start time is stored as a string
  endTime: { type: String, required: true }, // Assuming end time is stored as a string
  location: { type: String }, // Assuming location is stored as a string
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  participants: [
    {
      participant: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
      attended: { type: Boolean, default: false },
    },
  ],
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
