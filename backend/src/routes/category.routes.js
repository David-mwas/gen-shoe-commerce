const express = require("express");
const Category = require("../models/category.model.js");

const router = express.Router();

// GET /api/categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error("Get categories error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
