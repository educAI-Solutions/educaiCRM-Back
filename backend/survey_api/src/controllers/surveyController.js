const Survey = require("../models/surveyModel"); // Adjust path if necessary
const mongoose = require("mongoose");

// Mock function to send notifications (replace with actual notification logic)
const sendNotification = (userIds, message) => {
  console.log(`Sending notification to users: ${userIds.join(", ")}`);
  console.log(`Message: ${message}`);
};

const submitTeacherSurvey = async (req, res) => {
  const { userId, courseId, surveyData } = req.body;
  try {
    let survey = await Survey.findOne({ courseId, type: "teacher" });

    if (!survey) {
      // Create a new survey if it doesn't exist
      survey = new Survey({
        userId,
        type: "teacher",
        courseId,
        surveyData,
        participantsNotAnswered: [],
      });
    }

    if (!survey.participantsAnswered.includes(userId)) {
      survey.participantsAnswered.push(userId);
      const userIndex = survey.participantsNotAnswered.indexOf(userId);
      if (userIndex > -1) {
        survey.participantsNotAnswered.splice(userIndex, 1);
      }
    }

    await survey.save();
    res.json({ message: "Teacher survey submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting teacher survey", error });
  }
};

const submitDietarySurvey = async (req, res) => {
  const { userId, classId, surveyData } = req.body;
  try {
    const newSurvey = new Survey({ userId, type: "food", classId, surveyData });
    await newSurvey.save();
    res.json({ message: "Dietary survey submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting dietary survey", error });
  }
};

const submitAttendanceSurvey = async (req, res) => {
  const { userId, classId, surveyData } = req.body;
  try {
    const newSurvey = new Survey({
      userId,
      type: "attendance",
      classId,
      surveyData,
    });
    await newSurvey.save();
    res.json({ message: "Attendance survey submitted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting attendance survey", error });
  }
};

// Function to notify students missing the teacher survey
const notifyMissingParticipants = async () => {
  const surveys = await Survey.find({ type: "teacher" });

  surveys.forEach((survey) => {
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now - survey.startDate) / (1000 * 60 * 60 * 24)
    );

    let interval;
    if (daysSinceStart <= 7) {
      interval = 3;
    } else if (daysSinceStart <= 14) {
      interval = 2;
    } else {
      interval = 1;
    }

    const lastNotification = survey.lastNotification || survey.startDate;
    const daysSinceLastNotification = Math.floor(
      (now - lastNotification) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastNotification >= interval) {
      sendNotification(
        survey.participantsNotAnswered,
        "Please complete the teacher survey."
      );
      survey.lastNotification = now;
      survey.save();
    }
  });
};

// Call this function periodically (e.g., using setInterval or a cron job)
setInterval(notifyMissingParticipants, 24 * 60 * 60 * 1000); // Run daily

module.exports = {
  submitTeacherSurvey,
  submitDietarySurvey,
  submitAttendanceSurvey,
};
