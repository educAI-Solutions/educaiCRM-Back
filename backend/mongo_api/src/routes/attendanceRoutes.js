const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Generate attendance Excel file for a class
router.get(
  "/generate/:classId",
  attendanceController.generateAndDownloadAttendanceExcel
);

// Upload filled-out attendance Excel file
router.post("/upload/:classId", attendanceController.uploadAttendanceExcel);

module.exports = router;
