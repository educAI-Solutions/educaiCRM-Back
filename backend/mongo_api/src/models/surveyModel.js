const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["teacher", "dietary", "attendance"],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    surveyData: {
      type: Map,
      of: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Survey", surveySchema);
