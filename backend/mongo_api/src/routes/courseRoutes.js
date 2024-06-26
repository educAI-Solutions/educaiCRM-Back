const express = require("express");
const router = express.Router();
const CourseController = require("../controllers/courseController");
const {
  authenticateJWT,
  checkTeacherOrAdmin,
  checkAdmin,
} = require("../middleware/jwtAuth");
const { route } = require("./attendanceRoutes");

require("dotenv").config();
// Get the secret key from the environment variables
const secretKey = process.env.ACCESS_TOKEN_SECRET;

// Routes for CRUD operations on courses
router.post(
  "/create",
  //authenticateJWT,
  //checkTeacherOrAdmin,
  CourseController.createCourse
);
router.get(
  "/get-all",
  //authenticateJWT,
  CourseController.getAllCourses
);
router.get(
  "/get/:id",
  // authenticateJWT,
  CourseController.getCourseById
);
router.get(
  "/get/instructor/:id",
  // authenticateJWT,
  CourseController.getCourseByInstructor
);
router.get(
  "/get/participant/:id",
  // authenticateJWT,
  CourseController.getCourseByParticipant
);
router.put(
  "/update/:id",
  // authenticateJWT,
  // checkTeacherOrAdmin,
  CourseController.updateCourse
);
router.delete(
  "/delete/:id",
  // authenticateJWT,
  // checkAdmin,
  CourseController.deleteCourse
);

module.exports = router;
