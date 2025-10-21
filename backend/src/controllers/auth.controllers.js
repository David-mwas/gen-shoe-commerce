// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/user.model.js");

// const jwtSecret = process.env.JWT_SECRET || "secret";
// const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";

// async function signUp(req, res) {
//   try {
//     const { email, password, fullName } = req.body;
//     if (!email || !password)
//       return res.status(400).json({ message: "Missing fields" });

//     const exists = await User.findOne({ email });
//     if (exists)
//       return res.status(400).json({ message: "Email already registered" });

//     const passwordHash = await bcrypt.hash(password, 10);
//     const user = new User({
//       email,
//       passwordHash,
//       full_name: fullName || null,
//       is_admin: false,
//     });
//     await user.save();

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       jwtSecret,
//       {
//         expiresIn: jwtExpiresIn,
//       }
//     );

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         full_name: user.full_name,
//         is_admin: user.is_admin,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// }

// async function login(req, res) {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });
//     const ok = await bcrypt.compare(password, user.passwordHash);
//     if (!ok) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign(
//       { id: user._id, email: user.email, role: user.role },
//       jwtSecret,
//       {
//         expiresIn: jwtExpiresIn,
//       }
//     );
//     res.json({
//       token,
//       user: {
//         id: user._id,
//         email: user.email,
//         full_name: user.full_name,
//         is_admin: user.is_admin,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// }

// module.exports = {
//   signUp,
//   login,
// };

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model.js");
const { sendMail, compileResetPasswordHtml } = require("../lib/mailer.js");

const jwtSecret = process.env.JWT_SECRET || "secret";
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
// TTL in ms (default 1 hour)
const PASSWORD_RESET_TOKEN_TTL = Number(
  process.env.PASSWORD_RESET_TOKEN_TTL || 1000 * 60 * 60
);

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
      // default role remains as defined in model
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn,
      }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
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

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      jwtSecret,
      {
        expiresIn: jwtExpiresIn,
      }
    );
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/auth/forgot-password
 * Body: { email }
 *
 * Generates a one-time token, stores SHA256(token)  expiry on user, and
 * sends email with the raw token link. Response is generic to avoid enumeration.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() }).exec();
    if (!user) {
      // Always respond with same message to avoid account enumeration
      return res.json({
        message: "If that email exists we'll send a reset link.",
      });
    }

    // generate raw token and store only hash in DB
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL);
    await user.save();

    // prepare reset URL (frontend expected to have a reset page)
    const frontend = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.replace(/\/$/, "")
      : "";
    const resetUrl = `${frontend}/reset-password?token=${rawToken}&email=${encodeURIComponent(
      user.email
    )}`;

    // compile nice HTML (mailer helper may use MJML)
    const html = compileResetPasswordHtml({
      name: user.full_name || user.email,
      resetUrl,
    });

    // send email (non-blocking)
    sendMail({
      to: user.email,
      subject: "Reset your password",
      text: `Reset your password: ${resetUrl}`,
      html,
    }).catch((err) => console.error("Failed to send reset email:", err));
    console.log(resetUrl);
    return res.json({
      message: "If that email exists we'll send a reset link.",
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

/**
 * POST /api/auth/reset-password
 * Body: { email, token, newPassword }
 *
 * Validates token (by hashing provided token and comparing  expiry), sets new password,
 * clears token fields, returns success.
 */
async function resetPassword(req, res) {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword)
      return res.status(400).json({ message: "Missing parameters" });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    }).exec();

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    sendMail({
      to: user.email,
      subject: "Your password has been changed",
      text: "Your password was successfully changed.",
      html: `<p>Hi ${
        user.full_name || ""
      },</p><p>Your password was successfully changed.</p>`,
    }).catch((err) =>
      console.error("Failed to send password-change email:", err)
    );

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  signUp,
  login,
  forgotPassword,
  resetPassword,
};
