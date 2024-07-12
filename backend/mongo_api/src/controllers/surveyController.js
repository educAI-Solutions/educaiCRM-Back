const SurveyEntry = require("../models/surveyModel");
const Survey = require("../models/surveyModel");

// Controller function to handle teacher survey submission
const submitTeacherSurvey = async (req, res) => {
  try {
    const { userId, courseId, surveyData, surveyId } = req.body;

    // Check for existing survey
    const existingSurvey = await SurveyEntry.findOne({
      userId,
      type: "teacher",
      courseId,
      surveyId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this course" });
    }

    const survey = new SurveyEntry({
      userId,
      type: "teacher",
      courseId,
      surveyData,
      surveyId,
    });
    await survey.save();

    // Update the participantsAnswered and participantsNotAnswered fields in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { participantsAnswered: userId },
      $pull: { participantsNotAnswered: userId },
    });

    // Add the entry to the surveyEntries field in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { surveyEntries: survey._id },
    });

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
    const { userId, classId, surveyData, surveyId } = req.body;

    // Check for existing survey
    const existingSurvey = await SurveyEntry.findOne({
      userId,
      type: "food",
      classId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this class" });
    }

    const survey = new SurveyEntry({
      userId,
      type: "food",
      classId,
      surveyData,
      surveyId,
    });
    await survey.save();
    // Update the participantsAnswered and participantsNotAnswered fields in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { participantsAnswered: userId },
      $pull: { participantsNotAnswered: userId },
    });

    // Add the entry to the surveyEntries field in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { surveyEntries: survey._id },
    });
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
    const { userId, classId, surveyData, surveyId } = req.body;

    // Check for existing survey
    const existingSurvey = await SurveyEntry.findOne({
      userId,
      type: "attendance",
      classId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this class" });
    }

    const survey = new SurveyEntry({
      userId,
      type: "attendance",
      classId,
      surveyData,
      surveyId,
    });
    await survey.save();
    // Update the participantsAnswered and participantsNotAnswered fields in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { participantsAnswered: userId },
      $pull: { participantsNotAnswered: userId },
    });

    // Add the entry to the surveyEntries field in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { surveyEntries: survey._id },
    });
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
    const { userId, classId, surveyData, surveyId } = req.body;

    // Check for existing survey
    const existingSurvey = await SurveyEntry.findOne({
      userId,
      type: "class",
      classId,
    });
    if (existingSurvey) {
      return res
        .status(400)
        .json({ error: "Survey already submitted for this class" });
    }

    const survey = new SurveyEntry({
      userId,
      type: "class",
      classId,
      surveyData,
      surveyId,
    });
    await survey.save();
    // Update the participantsAnswered and participantsNotAnswered fields in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { participantsAnswered: userId },
      $pull: { participantsNotAnswered: userId },
    });

    // Add the entry to the surveyEntries field in the survey
    await Survey.findByIdAndUpdate(surveyId, {
      $push: { surveyEntries: survey._id },
    });
    res.json({ message: "Class survey submitted successfully" });
  } catch (error) {
    res.status(500).json({
      error: "Failed to submit class survey",
      details: error.message,
    });
  }
};

const createTeacherSurvey = async (req, res) => {
  const { courseId, participants } = req.body;
  try {
    let survey = await Survey.findOne({ courseId, type: "teacher" });

    if (!survey) {
      // Create a new survey if it doesn't exist
      survey = new Survey({
        type: "teacher",
        courseId,
        participantsNotAnswered: participants,
        participantsAnswered: [],
        surveyEntries: [],
      });
    } else {
      // Return an error if the survey already exists
      return res.status(400).json({ message: "Survey already exists" });
    }

    await survey.save();
    // Return the survey _id and success message
    res.json({ surveyId: survey._id, message: "Teacher survey created" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting teacher survey", error });
  }
};

const createFoodSurvey = async (req, res) => {
  const { classId, participants } = req.body;
  try {
    let survey = await Survey.findOne({ classId, type: "food" });

    if (!survey) {
      // Create a new survey if it doesn't exist
      survey = new Survey({
        type: "food",
        classId,
        participantsNotAnswered: participants,
        participantsAnswered: [],
        surveyEntries: [],
      });
    } else {
      // Return an error if the survey already exists
      return res.status(400).json({ message: "Survey already exists" });
    }

    await survey.save();
    // Return the survey _id and success message
    res.json({ surveyId: survey._id, message: "Dietary survey created" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting dietary survey", error });
  }
};

const createAttendanceSurvey = async (req, res) => {
  const { classId, participants } = req.body;
  try {
    let survey = await Survey.findOne({ classId, type: "attendance" });

    if (!survey) {
      // Create a new survey if it doesn't exist
      survey = new Survey({
        type: "attendance",
        classId,
        participantsNotAnswered: participants,
        participantsAnswered: [],
        surveyEntries: [],
      });
    } else {
      // Return an error if the survey already exists
      return res.status(400).json({ message: "Survey already exists" });
    }

    await survey.save();
    // Return the survey _id and success message
    res.json({ surveyId: survey._id, message: "Attendance survey created" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting attendance survey", error });
  }
};

const createClassSurvey = async (req, res) => {
  const { classId, participants } = req.body;
  try {
    let survey = await Survey.findOne({ classId, type: "class" });

    if (!survey) {
      // Create a new survey if it doesn't exist
      survey = new Survey({
        type: "class",
        classId,
        participantsNotAnswered: participants,
        participantsAnswered: [],
        surveyEntries: [],
      });
    } else {
      // Return an error if the survey already exists
      return res.status(400).json({ message: "Survey already exists" });
    }

    await survey.save();
    // Return the survey _id and success message
    res.json({ surveyId: survey._id, message: "Class survey created" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting class survey", error });
  }
};

const getTeacherSurvey = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const survey = await Survey.findOne({ courseId, type: "teacher" }).populate(
      "surveyEntries"
    );
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: "Error getting teacher survey", error });
  }
};

const updateSurvey = async (req, res) => {
  const surveyId = req.params.surveyId;
  const surveyData = req.body;
  try {
    const survey = await Survey.findByIdAndUpdate(surveyId, surveyData, {
      new: true,
    });
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: "Error updating survey", error });
  }
};

const getAllTeacherSurveys = async (req, res) => {
  try {
    const surveys = await Survey.find({ type: "teacher" }).populate(
      "surveyEntries"
    );
    res.json(surveys);
  } catch (error) {
    res.status(500).json({ message: "Error getting teacher surveys", error });
  }
};

const getAttendanceSurveyByClassId = async (req, res) => {
  const classId = req.params.classId;
  try {
    const survey = await Survey.findOne({
      classId,
      type: "attendance",
    }).populate("surveyEntries");
    if (!survey) {
      return res.status(404).json({ message: "Survey not found" });
    }
    res.json(survey);
  } catch (error) {
    res.status(500).json({ message: "Error getting attendance survey", error });
  }
};

module.exports = {
  createTeacherSurvey,
  createFoodSurvey,
  createAttendanceSurvey,
  createClassSurvey,
  submitTeacherSurvey,
  submitFoodSurvey,
  submitAttendanceSurvey,
  submitClassSurvey,
  getTeacherSurvey,
  updateSurvey,
  getAllTeacherSurveys,
  getAttendanceSurveyByClassId,
};
