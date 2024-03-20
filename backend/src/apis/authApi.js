const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  // Handle login logic here
  const { username, password } = req.body;

  // Example: Check username and password against database
  if (username === "admin" && password === "password") {
    const token = jwt.sign({ username }, "secretKey", { expiresIn: "1h" });
    // Send JWT token in response
    res.status(200).json({ success: true, message: "Login successful", token });
  } else {
    // Authentication failed
    res
      .status(401)
      .json({ success: false, message: "Invalid username or password" });
  }
});

module.exports = router;
