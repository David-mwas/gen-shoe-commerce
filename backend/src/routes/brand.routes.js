const express = require("express");
const Brand = require("../models/brand.model.js");

const router = express.Router();

// GET /api/brands
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    res.json(brands);
  } catch (err) {
    console.error("Get brands error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
