const express = require("express");
const router = express.Router();
const justificationController = require("../controllers/justificationController");

// Create a new justification
router.post("/create", justificationController.createJustification);

// Get all justifications
router.get("/get-all", justificationController.getAllJustifications);

// Get all justifications for a specific student
router.get(
  "/get-all/student/:studentId",
  justificationController.getJustificationsByStudent
);

// Get all justifications with a specific state (e.g. pending, accepted, rejected)
router.get(
  "/get-all/state/:state",
  justificationController.getJustificationsByState
);

// Get a specific justification
router.get("/get/:id", justificationController.getJustification);

// Update a specific justification
router.put("/update/:id", justificationController.updateJustification);

// Delete a specific justification
router.delete("/delete/:id", justificationController.deleteJustification);

module.exports = router;
