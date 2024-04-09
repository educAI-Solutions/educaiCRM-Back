const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/get-all", userController.getAllUsers);
router.get("/get-students", userController.getAllStudents);
router.get("/get-teachers", userController.getAllTeachers);
router.get("/get-recent", userController.getRecentUsers);
router.get("/get/:identifier", userController.getUserByIdentifier);

module.exports = router;
