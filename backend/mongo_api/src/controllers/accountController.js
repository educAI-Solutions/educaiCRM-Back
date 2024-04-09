const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/accountModel");
<<<<<<< HEAD:backend/mongo_api/src/controllers/accountController.js
require("dotenv").config();
const secretKey = process.env.ACCESS_TOKEN_SECRET;
=======
<<<<<<< Updated upstream:backend/src/routes/authRoutes.js
=======
const Program = require("../models/programModel");
const Course = require("../models/courseModel");
const Class = require("../models/classModel");
require("dotenv").config();
const secretKey = process.env.ACCESS_TOKEN_SECRET;
>>>>>>> Stashed changes:backend/mongo_api/src/controllers/accountController.js
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases:backend/src/routes/authRoutes.js

async function createAccount(username, email, password, role = "student") {
  try {
    const account = new Account({ username, email, password, role });
    const savedAccount = await account.save();
    console.log("Account created:", savedAccount);
  } catch (error) {
    console.error("Error creating account:", error);
  }
}

exports.registerUser = async (req, res) => {
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
};

exports.getUserDetails = async (req, res) => {
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
};

exports.loginUser = async (req, res) => {
  // Get username and password from request body
  const { identifier, password } = req.body;

  try {
    // Find the user by username
    const user = await Account.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      // User not found
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Passwords do not match
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    // get the role and _id of the user
    const username = user.username;
    const role = user.role;
    const id = user._id;

    // Passwords match, generate JWT token
    const token = jwt.sign({ username, role }, secretKey, {
      expiresIn: "1h",
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
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
};

<<<<<<< HEAD:backend/mongo_api/src/controllers/accountController.js
exports.deleteUser = async (req, res) => {
=======
<<<<<<< Updated upstream:backend/src/routes/authRoutes.js
// Delete route
router.delete("/delete/:username", async (req, res) => {
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases:backend/src/routes/authRoutes.js
  const { username } = req.params;
=======
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
>>>>>>> Stashed changes:backend/mongo_api/src/controllers/accountController.js

  try {
    // Find and delete the user by id
    const deletedUser = await Account.findByIdAndDelete(id);

    if (!deletedUser) {
      // User not found
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Remove the user from any programs, courses, and classes they are enrolled in
    await Program.updateMany(
      { participants: id },
      { $pull: { participants: id } }
    );
    await Course.updateMany(
      { participants: id },
      { $pull: { participants: id } }
    );
    // show through console.log the classes that are being found by the id
    await Class.updateMany(
      { "participants.participant": id },
      { $pull: { participants: { participant: id } } }
    );

    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
