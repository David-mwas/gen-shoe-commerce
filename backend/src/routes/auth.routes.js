const express = require("express");

const { authMiddleware } = require("../middleware/auth.js");
const { signUp, login } = require("../controllers/auth.controllers.js");

const {
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controllers.js");
const { forgotLimiter } = require("../middleware/limiters.js");
const { verifyToken } = require("../lib/verifyToken.js");

const router = express.Router();

// signup
router.post("/signup", signUp);

// login
router.post("/login", login);

// verify token
router.post("/token/verify", verifyToken);

// get current user
router.get("/me", authMiddleware, async (req, res) => {
  console.log("user", req.user);
  res.json({ user: req.user });
});

router.post("/forgot-password", forgotLimiter, forgotPassword);
router.post("/reset-password", resetPassword);
module.exports = router;
