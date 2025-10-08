// const express = require("express");
// const Product = require("../models/product.model.js");
// const multer = require("multer");
// const cloudinary = require("cloudinary").v2;

// const { authMiddleware, isAdmin } = require("../middleware/auth.js");
// const {
//   createProduct,
//   getProducts,
//   getProductBySlug,
//   getProductById,
// } = require("../controllers/product.controller.js");

// const router = express.Router();

// // POST /api/products
// // expects { name, description, price, image_url, stock_quantity, status, sizes, featured, brandId }
// // image upload to cloudinary then store url in image_url
// // Configure Cloudinary
// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // });

// // Multer setup for file upload
// // const storage = multer.memoryStorage();
// // const upload = multer({ storage });

// // POST /api/products
// router.post(
//   "/",
//   authMiddleware,
//   isAdmin,
//   // upload.single("image"),
//   createProduct
// );

// // GET /api/products
// // supports ?featured=true&status=in_stock&limit=8
// router.get("/", getProducts);

// // GET /api/products/:slug
// router.get("/:slug", getProductBySlug);

// // GET /api/products/id/:id
// router.get("/id/:id", getProductById);

// // update and delete routes can be added later for admin use

// router.put("/:id", authMiddleware, isAdmin, (req, res) => {
//   const { id } = req.params;
//   try {
//     const updatedProduct = Product.findByIdAndUpdate(
//       id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!updatedProduct)
//       return res.status(404).json({ message: "Product not found" });
//     res.json(updatedProduct);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// router.delete("/:id", authMiddleware, isAdmin, (req, res) => {
//   const { id } = req.params;
//   try {
//     Product.findByIdAndDelete(id, (err, deletedProduct) => {
//       if (err)
//         return res.status(500).json({ message: "Server error", error: err });
//       if (!deletedProduct)
//         return res.status(404).json({ message: "Not found" });
//       res.json({ message: "Product deleted successfully" });
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

// module.exports = router;
// routes/product.routes.js
const express = require("express");
const Product = require("../models/product.model.js");

const { authMiddleware, isAdmin } = require("../middleware/auth.js");
const {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
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
          req.body.sizes = s.split(",").map((x) => x.trim()).filter(Boolean);
        }
      } catch (_) {
        req.body.sizes = s.split(",").map((x) => x.trim()).filter(Boolean);
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
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete product (admin)
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Product.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    return res.json({ message: "Product deleted successfully", id: deleted._id });
  } catch (error) {
    console.error("product delete error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
