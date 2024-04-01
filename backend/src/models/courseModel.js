// Course Model
const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, required: true },
  section: { type: Number, required: true },
  instructors: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  ],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  // Add more fields as needed
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
