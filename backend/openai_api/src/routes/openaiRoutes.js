const express = require("express");
const router = express.Router();
const openaiController = require("../controllers/openaiController");

// Define routes
router.post("/generate-text", openaiController.generateText);

module.exports = router;
