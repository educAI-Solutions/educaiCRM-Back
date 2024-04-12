const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");
const {
  authenticateJWT,
  checkTeacherOrAdmin,
} = require("../middleware/jwtAuth");

// Define routes for classes
router.post("/create", classController.createClass);
router.get("/get/:id", classController.getClassById);
router.get("/get/teacher/:teacherId", classController.getClassesByTeacher);
router.get("/get/student/:studentId", classController.getClassesByStudent);
router.get("/get-all", classController.getAllClasses);
router.put("/update/:id", classController.updateClass);
router.delete("/delete/:id", classController.deleteClass);

module.exports = router;
