const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    category_id: { type: String, default: null },
    brand: {
      name: { type: String, default: null },
    },
    image_url: { type: String, default: "" },
    images: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    stock_quantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in_stock", "out_of_stock", "discontinued"],
      default: "in_stock",
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
