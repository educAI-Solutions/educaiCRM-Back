const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const CourseController = require("../controllers/courseController");
const Account = require("../models/accountModel");
const Course = require("../models/courseModel");

dotenv.config();
// Get the secret key from the environment variables
const secretKey = process.env.ACCESS_TOKEN_SECRET;

// Middleware to authenticate JWT and check admin
function authenticateJWTandAdmin(req, res, next) {
  // Get token from the headers
  console.log(req.headers);
  const token = req.headers.authorization.split(" ")[1];
  try {
    // Verify the token
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      // Check if role is admin
      if (user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden - Admins only" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Token error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }
}

// Middleware to authenticate JWT and check teacher or admin

function authenticateJWTandRole(req, res, next) {
  // Get token from the headers
  const token = req.headers.authorization.split(" ")[1];
  try {
    // Verify the token
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      // Check if role is teacher or admin
      if (user.role !== "teacher" && user.role !== "admin") {
        return res.status(403).json({
          message: "Forbidden - Teachers and Admins only",
        });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Token error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }
}

// Middleware to authenticate JWT only
function authenticateJWT(req, res, next) {
  // Get token from the headers
  const token = req.headers.authorization.split(" ")[1];
  try {
    // Verify the token
    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Token error:", error);
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized access" });
  }
}

// Routes for CRUD operations on courses
router.post("/create", authenticateJWTandRole, CourseController.createCourse);
router.get("/fetch-courses", authenticateJWT, CourseController.getCourses);
router.get(
  "/fetch-course/:id",
  authenticateJWT,
  CourseController.getCourseById
);
router.put(
  "/update-course/:id",
  authenticateJWTandRole,
  CourseController.updateCourse
);
router.delete(
  "/delete-course/:id",
  authenticateJWTandAdmin,
  CourseController.deleteCourse
);

module.exports = router;
