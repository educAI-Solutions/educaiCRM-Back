const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  section: { type: Number, required: true },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: "Program" },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
