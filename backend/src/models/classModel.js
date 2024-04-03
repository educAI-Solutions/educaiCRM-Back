const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  section: { type: Number, required: true },
  classDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, required: true },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }], // Reference to User collection for instructors
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }], // Reference to User collection for participants
  // Other fields
});

const Class = mongoose.model("Class", classSchema);

module.exports = Class;

// Ademas del curso, añadir programas curriculares como padre de cursos.
