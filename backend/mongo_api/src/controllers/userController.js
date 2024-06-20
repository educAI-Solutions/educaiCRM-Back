const Account = require("../models/accountModel");

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Account.find({ role: "student" });
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    console.error("Error getting all students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Account.find({ role: "teacher" });
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    console.error("Error getting all teachers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getRecentUsers = async (req, res) => {
  try {
    const recentUsers = await Account.find().sort({ createdAt: -1 }).limit(5);
    res.status(200).json({ success: true, data: recentUsers });
  } catch (error) {
    console.error("Error getting recent users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Account.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getUserByIdentifier = async (req, res) => {
  const { identifier } = req.params;

  try {
    const user = await Account.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    // Remove password from user object if it exists
    if (user) {
      user.password = undefined;
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error getting user by identifier:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
