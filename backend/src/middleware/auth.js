const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const jwtSecret = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Unauthorized", error: err.message });
  }
}

// is admin middleware
// authMiddleware.isAdmin = function (req, res, next) {
//   if (!req.user.is_admin)
//     return res.status(403).json({ message: "Forbidden" });
//   next();
// };

async function isAdmin(req, res, next) {
  if (!req.user.is_admin) return res.status(403).json({ message: "Forbidden" });
  next();
}
module.exports = { authMiddleware, isAdmin };
