const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

router.post("/teacher-survey", surveyController.submitTeacherSurvey);
router.post("/food-survey", surveyController.submitFoodSurvey);
router.post("/attendance-survey", surveyController.submitAttendanceSurvey);
router.post("/class-survey", surveyController.submitClassSurvey);

module.exports = router;
