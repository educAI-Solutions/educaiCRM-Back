const express = require("express");
const router = express.Router();
const storageController = require("../controllers/storageController");
const jwt = require("jsonwebtoken");
const upload = require("../middleware/uploadMiddleware");
require("dotenv").config();

const secretKey = process.env.ACCESS_TOKEN_SECRET;

// Middleware to authenticate JWT
function authenticateJWT(req, res, next) {
  // Get token from the headers
  const token = req.headers["authorization"].split(" ")[1];

  if (token) {
    // Verify the token
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

router.post("/upload", upload.single("file"), storageController.uploadFile);
router.get("/download/:filename", storageController.downloadFile);

module.exports = router;
