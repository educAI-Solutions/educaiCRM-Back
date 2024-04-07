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
router.put("/update/:id", classController.updateClass);
router.delete("/delete/:id", classController.deleteClass);

module.exports = router;
