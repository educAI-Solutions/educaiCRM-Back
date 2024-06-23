const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

router.post("/teacher-survey", surveyController.submitTeacherSurvey);
router.post("/dietary-survey", surveyController.submitDietarySurvey);
router.post("/attendance-survey", surveyController.submitAttendanceSurvey);

module.exports = router;
