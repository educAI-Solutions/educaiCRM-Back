const express = require("express");
const router = express.Router();
const programController = require("../controllers/programController");
const { authenticateJWT, checkAdmin } = require("../middleware/jwtAuth");

// Define routes for curricular programs
router.post("/create", programController.createProgram);
router.get("/get-all", programController.getAllPrograms);
router.get("/get/:id", programController.getProgramById);
router.put("/update/:id", programController.updateProgram);
router.delete("/delete/:id", programController.deleteProgram);

module.exports = router;
