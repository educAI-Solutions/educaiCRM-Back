const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createAccount } = require("../controllers/accountController");
const Account = require("../models/accountModel");

// Register route
router.post("/register", async (req, res) => {
  // Get username, email, and password from request body
  const { username, email, password, role } = req.body;

  try {
    // Check if the username or email already exists
    const existingUser = await Account.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    }

    // Hash the password (Change this to frontend for extra security later)
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create a new account
    await createAccount(username, email, hashedPassword, role);

    // Account created successfully
    res
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  // Get username and password from request body
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await Account.findOne({ username });

    if (!user) {
      // User not found
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Passwords do not match
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    // Passwords match, generate JWT token
    const token = jwt.sign({ username }, "secretKey", { expiresIn: "1h" });
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Profile route
router.get("/profile/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Find the user by username
    const user = await Account.findOne({ username });

    if (!user) {
      // User not found
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update route
router.put("/update/:username", async (req, res) => {
  const { username } = req.params;
  const { email, password } = req.body;

  try {
    // Find the user by username
    const user = await Account.findOne({ username });

    if (!user) {
      // User not found
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update user's email and password
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    // Save the updated user
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete route
router.delete("/delete/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Find and delete the user by username
    const deletedUser = await Account.findOneAndDelete({ username });

    if (!deletedUser) {
      // User not found
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
