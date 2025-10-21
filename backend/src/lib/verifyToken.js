const userModel = require("../models/user.model.js");
const crypto = require("crypto");

async function verifyToken(req, res) {
  const { email, token } = req.body;
  if (!email || !token)
    return res.status(400).json({ message: "Missing parameters" });
  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await userModel
      .findOne({
        email: email.toLowerCase(),
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    return res.status(200).json({ message: "verified" });
  } catch (error) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  verifyToken,
};
