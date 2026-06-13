const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");

    req.user = decoded; // Attach user payload to the request
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};