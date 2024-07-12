const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");
const upload = require("../middleware/uploadMiddleware");
const {
  authenticateJWT,
  checkTeacherOrAdmin,
  checkAdmin,
} = require("../middleware/jwtAuth");

router.post(
  "/upload/attendance",
  // authenticateJWT,
  // checkTeacherOrAdmin,
  upload.single("file"),
  storageController.uploadAttendance
);
router.post(
  "/upload/justifications",
  // authenticateJWT,
  upload.single("file"),
  storageController.uploadJustifications
);
router.post(
  "/upload/rules",
  // authenticateJWT,
  // checkAdmin,
  upload.single("file"),
  storageController.uploadRules
);
router.post(
  "/upload/qr-code",
  // authenticateJWT,
  // checkAdmin,
  upload.single("file"),
  storageController.uploadQRCode
);
router.get(
  "/download/attendance/:filename/:fileExtension",
  storageController.downloadAttendance
);
router.get(
  "/download/justifications/:filename/:fileExtension",
  storageController.downloadJustification
);
router.get(
  "/download/rules/:filename/:fileExtension",
  storageController.downloadRules
);

router.get("/download/qr-code/:filename", storageController.downloadQRCode);

module.exports = router;
