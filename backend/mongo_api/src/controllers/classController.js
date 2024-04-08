const Class = require("../models/classModel");
const Course = require("../models/courseModel");

// Controller methods for classes
exports.createClass = async (req, res) => {
  try {
    const { name, date, startTime, endTime, location, course } = req.body;

    // Find the course
    const courseData = await Course.findById(course)
      .populate("participants")
      .populate("instructors");

    // Create participants array
    const participants = courseData.participants.map((participant) => ({
      participant: participant._id,
      attended: false,
    }));

    // Create instructors array
    const instructors = courseData.instructors.map(
      (instructor) => instructor._id
    );

    const newClass = new Class({
      name,
      date,
      startTime,
      endTime,
      location,
      course,
      instructors,
      participants,
    });

    await newClass.save();

    res.status(201).json({
      success: true,
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundClass = await Class.findById(id).populate("course instructors");
    if (!foundClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    res.status(200).json({ success: true, data: foundClass });
  } catch (error) {
    console.error("Error getting class by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClass = await Class.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updatedClass,
    });
  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
