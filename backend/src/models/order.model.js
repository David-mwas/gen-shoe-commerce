const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  product_name: { type: String, required: true },
  product_image: { type: String, default: null },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String, default: null },
  color: { type: String, default: null },
});

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    order_number: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    total_amount: { type: Number, required: true },
    payment_method: { type: String, enum: ["mpesa", "stripe"], required: true },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    payment_details: { type: mongoose.Schema.Types.Mixed, default: null },
    shipping_address: { type: mongoose.Schema.Types.Mixed, default: null },
    customer_phone: { type: String, default: null },
    customer_email: { type: String, default: null },
    notes: { type: String, default: null },
    items: { type: [OrderItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
