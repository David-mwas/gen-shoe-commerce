const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1 },
    size: { type: String, required: true },
    color: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CartItem", CartItemSchema);
