require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { defaultAuthRateLimiter } = require("../middleware/rateLimiter");

// user registration
router.post("/register", defaultAuthRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS)
    );
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registration successful." });
  } catch (err) {
    res.status(500).json({ error: "Error registering user " + err });
  }
});

// user login - generate and set jwt token in cookie
router.post("/login", defaultAuthRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
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
    res.status(201).json({ message: "User login successful.", token });
  } catch (err) {
    res.status(500).json({ error: "Error logging in " + err });
  }
});

// user logout - clear jwt token from cookie. Add token to revoked token db
router.get("/logout", defaultAuthRateLimiter, (req, res) => {
  try {
    res.clearCookie("token");
    res.status(204).json({ message: "Token cookie cleared successfully." });
  } catch (err) {
    res.status(500).json({ error: "Error logging out " + err });
  }
});

module.exports = router;
