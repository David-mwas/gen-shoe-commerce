const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // hashed
    full_name: { type: String, default: null },
    phone: { type: String, default: null },
    address: { type: mongoose.Schema.Types.Mixed, default: null },
    // is_admin: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },

  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
