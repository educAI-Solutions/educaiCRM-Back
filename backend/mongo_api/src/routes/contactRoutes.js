const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const {
  authenticateJWT,
  checkTeacherOrAdmin,
} = require("../middleware/jwtAuth");

// Define routes for classes
router.post("/create", contactController.createContact);

module.exports = router;
