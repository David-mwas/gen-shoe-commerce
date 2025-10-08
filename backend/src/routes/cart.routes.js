const express = require("express");

// const Product = require("../models/product.model.js");
const { authMiddleware } = require("../middleware/auth.js");
const {
  getCurrentUserCartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  addToCart,
} = require("../controllers/cart.controllers.js");

const router = express.Router();

// get cart for current user
router.get("/", authMiddleware, getCurrentUserCartItems);

// add to cart (if same product+size+color exist increment)
router.post("/", authMiddleware, addToCart);

// update quantity
router.put("/:id", authMiddleware, updateQuantity);

// delete item
router.delete("/:id", authMiddleware, removeFromCart);

// clear cart
router.delete("/", authMiddleware, clearCart);

module.exports = router;
