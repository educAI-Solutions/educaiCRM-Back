const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authenticateJWT = require("../middleware/jwtAuth"); // Assuming you have auth middleware

router.post(
  "/",
  // authenticateJWT,
  notificationController.createNotification
);
router.get(
  "/",
  // authenticateJWT,
  notificationController.getNotifications
);

// Routes for updating, deleting, etc.

module.exports = router;
