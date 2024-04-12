const mongoose = require("mongoose");

const JustificationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  classes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
  ],
  fullname: {
    type: String,
    required: true,
  },
  rut: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: Date.now,
  },
  state: {
    type: String,
    enum: ["pending", "accepted", "rejected", "cancelled", "questioned"],
    default: "pending",
  },
  fileExtension: {
    type: String,
  },
});

module.exports = mongoose.model("Justification", JustificationSchema);
