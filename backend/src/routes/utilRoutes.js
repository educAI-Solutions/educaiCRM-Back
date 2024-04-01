const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const Account = require("../models/accountModel");

dotenv.config();
// Get the secret key from the environment variables
const secretKey = process.env.ACCESS_TOKEN_SECRET;

router.get("/fetch-recent-users", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const user = jwt.verify(token, secretKey);
    if (user.role !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Token error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  // Try to get the 5 last created accounts
  try {
    const accounts = await Account.find().sort({ createdAt: -1 }).limit(5);
    // Delete the password field from each account
    accounts.forEach((account) => {
      account.password = undefined;
    });
    res.status(200).json({ success: true, accounts });
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.get("/fetch-user", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  // get the user identifier from the params
  const identifier = req.query.searchTerm;

  try {
    const user = jwt.verify(token, secretKey);
    if (user.role !== "admin") {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized access" });
    }
  } catch (error) {
    console.error("Token error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }

  try {
    const account = await Account.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    // Delete the password field
    account.password = undefined;
    res.status(200).json({ success: true, account });
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
