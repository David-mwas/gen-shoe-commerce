const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

async function signUp(req, res) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      passwordHash,
      full_name: fullName || null,
      is_admin: false,
    });
    await user.save();

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: jwtExpiresIn,
    });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  signUp,
  login,
};
