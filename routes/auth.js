require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const addRevokeToken = require("../token_handler_functions/addRevokeToken");
const sendResetEmail = require("../token_handler_functions/sendResetEmail");

const {
  resetPasswordRequestLimiter,
  resetPasswordSubmitLimiter,
  defaultAuthRateLimiter,
} = require("../middleware/rateLimiter");

// user registration
router.post("/register", defaultAuthRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registration successful." });
  } catch (err) {
    res.status(500).json({ error: "Error registering user " + err });
  }
});

// user login - generate and set jwt token in cookie
router.post("/login", defaultAuthRateLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "No such user in DB" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Wrong Password" });
    }

    // generating jwt access token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: "400d", // Expires in 400 days
      }
    );

    res.cookie("token", token, {
      httpOnly: true, // prevents client side js from accessing the cookie (XSS prevented)
      secure: true, // ensure the cookie is sent only over https
      sameSite: "strict", // prevents csrf (set to 'lax' for slightly relaxed behaviour ) - no other website can access this.
      // 400 days
      maxAge: 34560000000, // cookie expiration in ms (matches JWT expiration)
    });
    res.status(201).json({ message: "User login successful." });
  } catch (err) {
    res.status(500).json({ error: "Error logging in " + err });
  }
});

// user logout - clear jwt token from cookie. Add token to revoked token db
router.post("/logout", defaultAuthRateLimiter, (req, res) => {
  try {
    addRevokeToken(req.cookies.token);
    res.clearCookie("token");
    res.redirect("/login");
  } catch (err) {
    res.status(500).json({ error: "Error logging out " + err });
  }
});

// initiate reset user password - generate resetToken, send reset link via email
router.post(
  "/request-reset-password",
  resetPasswordRequestLimiter,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Check if the email exists in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Generating a reset token
      const resetToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_RESET_TOKEN_SECRET,
        {
          expiresIn: "10m", // Expires in 400 days
        }
      );

      // Send password reset email (using a service like Nodemailer)
      sendResetEmail(email, resetToken);

      res.status(200).json({ message: "Password reset email sent" });
    } catch (err) {
      res
        .status(500)
        .json({ error: "Error sending password reset email " + err });
    }
  }
);

// user clicks the link to this route in email.eg. /reset-password?token=<token>
router.get("/reset-password", resetPasswordRequestLimiter, async (req, res) => {
  try {
    const { token } = req.query;
    try {
      // Check token validity
      jwt.verify(token, process.env.JWT_RESET_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid Reset Token " + err });
    }
    // redirect to password reset page
    res.redirect(`/new-password?token=${token}`);
  } catch (error) {
    res.status(500).json({ error: "Error validating reset token " + err });
  }
});

// final new password form
router.post("/new-password", resetPasswordSubmitLimiter, async (req, res) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_RESET_TOKEN_SECRET);
    // Updating the user's password
    const user = await User.findOne({ _id: decoded.userId });
    // hashing new password first
    user.password = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );

    await user.save();
    res.status(200).json({
      message: "Password reset successful. You can close this page now.",
    });
  } catch (error) {
    res.status(500).json({ error: "Error updating user password " + error });
  }
});

module.exports = router;
