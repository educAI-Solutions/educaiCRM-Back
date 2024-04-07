const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const Program = mongoose.model("Program", ProgramSchema);

module.exports = Program;
