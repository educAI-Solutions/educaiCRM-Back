const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Notification from MongoDB Notification collection
router.post("/", notificationController.sendNotification);

// Manual notification
router.post("/manual", notificationController.sendManualNotification);

module.exports = router;
