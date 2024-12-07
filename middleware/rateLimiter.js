const rateLimit = require("express-rate-limit");

// Rate limiter for the request reset password endpoint
const resetPasswordRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: "Too many requests, please try again later.",
});

// Rate limiter for the reset password form submission (post)
const resetPasswordSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 requests per windowMs (password reset submissions)
  message: "Too many attempts, please try again later.",
});

// Default Rate limiter for all auth routes
const defaultAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  message: "Too many attempts, please try again later.",
});

// Default Rate limiter for all protected routes
const defaultProtectedRouteRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 10 requests per windowMs
  message: "Too many attempts, please try again later.",
});

module.exports = {
  resetPasswordRequestLimiter,
  resetPasswordSubmitLimiter,
  defaultAuthRateLimiter,
  defaultProtectedRouteRateLimiter,
};
