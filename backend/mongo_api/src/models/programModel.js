const mongoose = require("mongoose");

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
  state: { type: String, default: "active" }, // Assuming state can be "active" or "inactive"
});

const Program = mongoose.model("Program", ProgramSchema);

module.exports = Program;
