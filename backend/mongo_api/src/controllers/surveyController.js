const Survey = require("../models/surveyModel");

// Controller function to handle teacher survey submission
const submitTeacherSurvey = async (req, res) => {
  try {
    const { userId, courseId, surveyData } = req.body;
    const survey = new Survey({
      userId,
      type: "teacher",
      courseId,
      surveyData,
    });
    await survey.save();
    res.json({ message: "Teacher survey submitted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit teacher survey",
      details: error.message,
    });
  }
};

// Controller function to handle dietary survey submission
const submitFoodSurvey = async (req, res) => {
  try {
    const { userId, classId, surveyData } = req.body;
    const survey = new Survey({
      userId,
      type: "dietary",
      classId,
      surveyData,
    });
    await survey.save();
    res.json({ message: "Dietary survey submitted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit dietary survey",
      details: error.message,
    });
  }
};

// Controller function to handle attendance survey submission
const submitAttendanceSurvey = async (req, res) => {
  try {
    const { userId, classId, surveyData } = req.body;
    const survey = new Survey({
      userId,
      type: "attendance",
      classId,
      surveyData,
    });
    await survey.save();
    res.json({ message: "Attendance survey submitted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit attendance survey",
      details: error.message,
    });
  }
};

module.exports = {
  submitTeacherSurvey,
  submitFoodSurvey,
  submitAttendanceSurvey,
};
