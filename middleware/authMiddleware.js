const jwt = require("jsonwebtoken");
const checkTokenRevoked = require("../token_handler_functions/checkTokenRevoked");

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Access Denied" });
  if (checkTokenRevoked)
    return res.status(401).json({ error: "Token Revoked." });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token " + error });
  }
}

module.exports = verifyToken;
