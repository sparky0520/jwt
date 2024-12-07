const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

const {
  defaultProtectedRouteRateLimiter,
} = require("../middleware/rateLimiter");

// Protected Routes - requiring authorization
router.get("/", defaultProtectedRouteRateLimiter, verifyToken, (req, res) => {
  res.status(200).json({ message: "Protected Route Accessed!" });
});

module.exports = router;
