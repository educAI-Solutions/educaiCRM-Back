const express = require("express");
const router = express.Router();
const multer = require("multer");
const attendanceController = require("../controllers/attendanceController");

const upload = multer({ storage: multer.memoryStorage() });

// Generate attendance Excel file for a class
router.get(
  "/generate/:classId",
  attendanceController.generateAndDownloadAttendanceExcel
);

// Upload filled-out attendance Excel file
router.post(
  "/upload/:classId",
  upload.single("file"),
  attendanceController.uploadAttendanceExcel
);

module.exports = router;
