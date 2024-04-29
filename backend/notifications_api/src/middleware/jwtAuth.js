const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.ACCESS_TOKEN_SECRET;

// Middleware to authenticate JWT
function authenticateJWT(req, res, next) {
  const token = req.headers["authorization"];

  if (token) {
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

// Middleware to check if the user is a teacher or admin
function checkTeacherOrAdmin(req, res, next) {
  const user = req.user;

  if (user && (user.role === "teacher" || user.role === "admin")) {
    next();
  } else {
    res.sendStatus(403);
  }
}

// Middleware to check if the user is an admin
function checkAdmin(req, res, next) {
  const user = req.user;

  if (user && user.role === "admin") {
    next();
  } else {
    res.sendStatus(403);
  }
}
