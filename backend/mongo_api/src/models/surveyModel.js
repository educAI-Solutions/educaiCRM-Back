const mongoose = require("mongoose");

const surveyEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    type: {
      type: String,
      enum: ["teacher", "food", "attendance", "class"],
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
    surveyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
  },
  { timestamps: true }
);

const surveySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["teacher", "food", "attendance", "class"],
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
    // Use an array of objects to store the ids of the surveyEntries
    surveyEntries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SurveyEntry",
      },
    ],
    participantsAnswered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    participantsNotAnswered: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    weekNumber: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SurveyEntry", surveyEntrySchema);
module.exports = mongoose.model("Survey", surveySchema);
