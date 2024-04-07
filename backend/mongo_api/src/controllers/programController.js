const Program = require("../models/programModel");

// Controller methods for curricular programs
exports.createProgram = async (req, res) => {
  try {
    const { name, description, courses } = req.body;
    const newProgram = new Program({ name, description, courses });
    await newProgram.save();
    res.status(201).json({
      success: true,
      message: "Program created successfully",
      data: newProgram,
    });
  } catch (error) {
    console.error("Error creating program:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundProgram = await Program.findById(id).populate("courses");
    if (!foundProgram) {
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }
    res.status(200).json({ success: true, data: foundProgram });
  } catch (error) {
    console.error("Error getting program by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProgram = await Program.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProgram) {
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }
    res.status(200).json({
      success: true,
      message: "Program updated successfully",
      data: updatedProgram,
    });
  } catch (error) {
    console.error("Error updating program:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProgram = await Program.findByIdAndDelete(id);
    if (!deletedProgram) {
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
