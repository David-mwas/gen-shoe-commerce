// routes/product.routes.js
const express = require("express");
const Product = require("../models/product.model.js");

const { authMiddleware, isAdmin } = require("../middleware/auth.js");
const {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  deleteProduct,
} = require("../controllers/product.controller.js");

const router = express.Router();

/**
 * Route order matters:
 * - GET /api/products/           -> list
 * - GET /api/products/id/:id     -> fetch by DB id (put this before slug route)
 * - GET /api/products/:slug      -> fetch by slug
 */

// List & create
router.get("/", getProducts);

// Create (admin)
router.post("/", authMiddleware, isAdmin, createProduct);

// Get by DB id (move before slug so /id/:id isn't captured by :slug)
router.get("/id/:id", getProductById);

// Get by slug
router.get("/:slug", getProductBySlug);

// Update product (admin)
// NOTE: ensure req.body fields are the right shape (sizes should be array or will be normalized)
router.put("/:id", authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    // Normalize sizes if needed (accept comma-separated string or JSON string)
    if (req.body && req.body.sizes && typeof req.body.sizes === "string") {
      const s = req.body.sizes.trim();
      try {
        // try parse JSON array first
        if (s.startsWith("[")) {
          req.body.sizes = JSON.parse(s);
        } else {
          req.body.sizes = s
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
        }
      } catch (_) {
        req.body.sizes = s
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);
      }
    }

    // run validators and return the updated document
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).exec();

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(updatedProduct);
  } catch (error) {
    console.error("product update error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// Delete product (admin)
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

module.exports = router;
