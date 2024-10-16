const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const {
  authenticateJWT,
  checkTeacherOrAdmin,
  checkAdmin,
} = require("../middleware/jwtAuth");

require("dotenv").config();
// Get the secret key from the environment variables
const secretKey = process.env.ACCESS_TOKEN_SECRET;

// Register route
router.post(
  "/register",
  // authenticateJWT,
  // checkAdmin,
  accountController.registerUser
);

// Login route
router.post("/login", accountController.loginUser);

// Profile route
router.get(
  "/profile/:username",
  // authenticateJWT,
  accountController.getUserDetails
);

// Update role route
router.put(
  "/updateRole/:id",
  // authenticateJWT,
  accountController.updateUserRole
);

// Delete route
router.delete(
  "/delete/:id",
  // authenticateJWT,
  // checkAdmin,
  accountController.deleteUser
);

// Get user program route
router.get(
  "/program/:userId",
  // authenticateJWT,
  accountController.getUserProgram
);

module.exports = router;
