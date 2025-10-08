const express = require("express");

const { authMiddleware } = require("../middleware/auth.js");
const { signUp, login } = require("../controllers/auth.controllers.js");

const router = express.Router();

// signup
router.post("/signup", signUp);

// login
router.post("/login", login);

// get current user
router.get("/me", authMiddleware, async (req, res) => {
  console.log("user",req.user)
  res.json({ user: req.user });
});

module.exports = router;
