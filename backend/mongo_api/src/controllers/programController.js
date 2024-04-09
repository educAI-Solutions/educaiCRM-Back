const Program = require("../models/programModel");
<<<<<<< HEAD
=======
const Course = require("../models/courseModel");
const Class = require("../models/classModel");
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases

// Controller methods for curricular programs
exports.createProgram = async (req, res) => {
  try {
    const { name, description, courses, participants } = req.body;
    const newProgram = new Program({
      name,
      description,
      courses,
      participants,
    });
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

exports.getAllPrograms = async (req, res) => {
  try {
    const allPrograms = await Program.find().populate("courses participants");
    // remove the password field from each user
    allPrograms.forEach((program) => {
      program.participants.forEach((participant) => {
        participant.password = undefined;
      });
    });
    res.status(200).json({ success: true, data: allPrograms });
  } catch (error) {
    console.error("Error getting all programs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getProgramById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundProgram = await Program.findById(id).populate(
      "courses participants"
    );
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
<<<<<<< HEAD
    const { id } = req.params;
    const deletedProgram = await Program.findByIdAndDelete(id);
    if (!deletedProgram) {
=======
    const programId = req.params.id;

    // Find the program
    const programData = await Program.findById(programId);

    if (!programData) {
>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
      return res
        .status(404)
        .json({ success: false, message: "Program not found" });
    }
<<<<<<< HEAD
=======

    // Delete all related courses and their child classes
    for (let courseId of programData.courses) {
      await Class.deleteMany({ course: courseId });
      await Course.deleteOne({ _id: courseId });
    }

    // Delete the program
    await Program.deleteOne({ _id: programId });

>>>>>>> ES-55-Funcionalidad-de-CRUD-de-Clases
    res
      .status(200)
      .json({ success: true, message: "Program deleted successfully" });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
