const Justification = require("../models/justificationModel");

exports.createJustification = async (req, res) => {
  try {
    const { student, classes, fullname, rut, reason, startDate, endDate } =
      req.body;
    console.log(req.body);
    const justification = await Justification.create({
      student,
      classes,
      fullname,
      rut,
      reason,
      startDate,
      endDate,
    });
    await justification.save();
    res.status(201).json({ success: true, data: justification });
  } catch (error) {
    console.log("Error creating justification:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getJustification = async (req, res) => {
  try {
    const justification = await Justification.findById(req.params.id);
    if (!justification) {
      return res
        .status(404)
        .json({ success: false, error: "No justification found" });
    }
    res.status(200).json({ success: true, data: justification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAllJustifications = async (req, res) => {
  try {
    const justifications = await Justification.find();
    res.status(200).json({ success: true, data: justifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getJustificationsByStudent = async (req, res) => {
  try {
    const justifications = await Justification.find({
      student: req.params.studentId,
    });
    res.status(200).json({ success: true, data: justifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getJustificationsByState = async (req, res) => {
  try {
    const justifications = await Justification.find({
      state: req.params.state,
    });
    res.status(200).json({ success: true, data: justifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateJustification = async (req, res) => {
  try {
    const justification = await Justification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!justification) {
      return res
        .status(404)
        .json({ success: false, error: "No justification found" });
    }
    res.status(200).json({ success: true, data: justification });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteJustification = async (req, res) => {
  try {
    const justification = await Justification.findByIdAndDelete(req.params.id);
    if (!justification) {
      return res
        .status(404)
        .json({ success: false, error: "No justification found" });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
