const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  participant: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Reference to participant
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" }, // Reference to class
  date: { type: Date, default: Date.now }, // Date of the class/event
  attended: { type: Boolean, default: false }, // Whether the participant attended or not
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
