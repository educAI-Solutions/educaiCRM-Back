const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/surveyController");

router.post("/teacher-survey", surveyController.submitTeacherSurvey);
router.post("/food-survey", surveyController.submitFoodSurvey);
router.post("/attendance-survey", surveyController.submitAttendanceSurvey);
router.post("/class-survey", surveyController.submitClassSurvey);
router.post("/create-teacher-survey", surveyController.createTeacherSurvey);
router.post("/create-food-survey", surveyController.createFoodSurvey);
router.post(
  "/create-attendance-survey",
  surveyController.createAttendanceSurvey
);
router.post("/create-class-survey", surveyController.createClassSurvey);
router.get("/get-teacher-survey/:courseId", surveyController.getTeacherSurvey);
router.put("/update/:surveyId", surveyController.updateSurvey);
router.get("/get-all-teacher-surveys", surveyController.getAllTeacherSurveys);
router.get("/get/:classId", surveyController.getAttendanceSurveyByClassId);

module.exports = router;
