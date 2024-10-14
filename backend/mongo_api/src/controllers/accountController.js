const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Account = require("../models/accountModel");
const Program = require("../models/programModel");
const Course = require("../models/courseModel");
const Class = require("../models/classModel");
require("dotenv").config();
const secretKey = process.env.ACCESS_TOKEN_SECRET;

// Import the logging module
const winston = require("winston");

// Configure logging
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} - ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "app.log" }),
  ],
});

async function createAccount(username, email, password, role = "student") {
  try {
    const account = new Account({ username, email, password, role });
    const savedAccount = await account.save();
    logger.info(`Account created: ${savedAccount}`);
  } catch (error) {
    logger.error(`Error creating account: ${error}`);
  }
}

exports.registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Log the registration attempt with DEBUG level
    logger.debug(
      `Attempting to register user with username: ${username} and email: ${email}`
    );

    const existingUser = await Account.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      logger.info(`Username or email already exists: ${username}, ${email}`);
      return res
        .status(400)
        .json({ success: false, message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createAccount(username, email, hashedPassword, role);

    logger.info(`User registered successfully: ${username}`);
    res
      .status(201)
      .json({ success: true, message: "Account created successfully" });
  } catch (error) {
    logger.error(`Registration error for user ${username}: ${error}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getUserDetails = async (req, res) => {
  const { username } = req.params;

  try {
    logger.debug(`Fetching details for user: ${username}`);
    const user = await Account.findOne({ username });

    if (!user) {
      logger.info(`User not found: ${username}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    logger.info(`User details retrieved: ${username}`);
    res.status(200).json({ success: true, user });
  } catch (error) {
    logger.error(`Profile error for user ${username}: ${error}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getUserProgram = async (req, res) => {
  const { userId } = req.params;

  try {
    logger.debug(`Fetching programs for user ID: ${userId}`);
    const programs = await Program.find({ participants: userId });

    if (!programs) {
      logger.info(`No programs found for user ID: ${userId}`);
      return res
        .status(404)
        .json({ success: false, message: "No programs found" });
    }

    logger.info(`Programs retrieved for user ID: ${userId}`);
    // Parse to only get the first program if there are multiple
    const program = programs[0];
    // return the program
    res.status(200).json({ success: true, program });
  } catch (error) {
    logger.error(`Program error for user ID ${userId}: ${error}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    logger.debug(`Login attempt for identifier: ${identifier}`);
    const user = await Account.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      logger.info(
        `Login failed for identifier: ${identifier} - User not found`
      );
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      logger.info(
        `Login failed for identifier: ${identifier} - Password mismatch`
      );
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password",
      });
    }

    const { username, role, _id: id } = user;
    const token = jwt.sign({ username, role, id }, secretKey, {
      expiresIn: "1h",
    });

    logger.info(`User logged in successfully: ${username}`);
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (error) {
    logger.error(`Login error for identifier ${identifier}: ${error}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    logger.debug(`Updating role for user ID: ${id}`);
    const user = await Account.findById(id);

    if (!user) {
      logger.info(`User not found for ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    logger.info(`User role updated successfully for ID: ${id}`);
    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      updatedUser: user,
    });
  } catch (error) {
    logger.error(`Update error for user ID ${id}: ${error}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    logger.debug(`Deleting user ID: ${id}`);
    const deletedUser = await Account.findByIdAndDelete(id);

    if (!deletedUser) {
      logger.info(`User not found for deletion, ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await Program.updateMany(
      { participants: id },
      { $pull: { participants: id } }
    );
    await Course.updateMany(
      { participants: id },
      { $pull: { participants: id } }
    );
    await Class.updateMany(
      { "participants.participant": id },
      { $pull: { participants: { participant: id } } }
    );

    logger.info(`User deleted successfully, ID: ${id}`);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    logger.error(`Delete error for user ID ${id}: ${error}`);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
