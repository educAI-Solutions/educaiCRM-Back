const Survey = require("../models/surveyModel");

// Controller function to handle teacher survey submission
const submitTeacherSurvey = async (req, res) => {
  try {
    const { userId, courseId, surveyData } = req.body;

    // Check for existing survey
    const existingSurvey = await Survey.findOne({
      userId,
      type: "teacher",
      courseId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this course" });
    }

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

    // Check for existing survey
    const existingSurvey = await Survey.findOne({
      userId,
      type: "food",
      classId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this class" });
    }

    const survey = new Survey({
      userId,
      type: "food",
      classId,
      surveyData,
    });
    await survey.save();
    res.json({ message: "Food survey submitted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit food survey",
      details: error.message,
    });
  }
};

// Controller function to handle attendance survey submission
const submitAttendanceSurvey = async (req, res) => {
  try {
    const { userId, classId, surveyData } = req.body;

    // Check for existing survey
    const existingSurvey = await Survey.findOne({
      userId,
      type: "attendance",
      classId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this class" });
    }

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

// Controller function to handle class survey submission
const submitClassSurvey = async (req, res) => {
  try {
    const { userId, classId, surveyData } = req.body;

    // Check for existing survey
    const existingSurvey = await Survey.findOne({
      userId,
      type: "class",
      classId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this class" });
    }

    const survey = new Survey({
      userId,
      type: "class",
      classId,
      surveyData,
    });
    await survey.save();
    res.json({ message: "Class survey submitted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit class survey",
      details: error.message,
    });
  }
};

module.exports = {
  submitTeacherSurvey,
  submitFoodSurvey,
  submitAttendanceSurvey,
  submitClassSurvey,
};
