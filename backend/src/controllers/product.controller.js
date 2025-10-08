const Product = require("../models/product.model.js");


function parseSizes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    const s = raw.trim();
    // if string looks like JSON array, try parse
    if (s.startsWith("[")) {
      try {
        return JSON.parse(s);
      } catch (err) {
        // fallthrough to comma-split
      }
    }
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

async function createProduct(req, res) {
  try {
    // accept both snake_case and camelCase keys from frontend
    const {
      name,
      description = "",
      price,
      stock_quantity,
      stockQuantity, // sometimes camelCase
      status,
      sizes,
      featured,
      brandId,
      brand_id,
      category_id,
      categoryId,
      slug,
      image_url,
      images,
    } = req.body || {};
    console.log("Request body:", req.body);

    // normalize fields
    const finalStock = Number(stock_quantity ?? stockQuantity ?? 0);
    const sizesArr = parseSizes(sizes);

    // Basic validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return res
        .status(400)
        .json({ message: "Missing or invalid field: name" });
    }
    if (isNaN(Number(price))) {
      return res
        .status(400)
        .json({ message: "Missing or invalid field: price" });
    }
    if (!status || typeof status !== "string") {
      return res
        .status(400)
        .json({ message: "Missing or invalid field: status" });
    }
    if (!Array.isArray(sizesArr) || sizesArr.length === 0) {
      return res.status(400).json({
        message: "Missing or invalid field: sizes (provide at least one)",
      });
    }
    if (
      !image_url &&
      (!images || (Array.isArray(images) && images.length === 0))
    ) {
      // optional: require at least a main image
      // return res.status(400).json({ message: "Image URL is required" });
      // we will allow it but warn
      console.warn("createProduct: no image_url provided for product", name);
    }

    const productData = {
      name: name.trim(),
      description: description || "",
      slug: slug || undefined,
      price: Number(price),
      image_url: image_url || (Array.isArray(images) && images[0]) || "",
      images: Array.isArray(images) ? images : [],
      sizes: sizesArr,
      colors: Array.isArray(req.body.colors)
        ? req.body.colors
        : parseSizes(req.body.colors),
      stock_quantity: finalStock,
      status,
      featured: !!featured,
      brand: brand_id || brandId || null, // set whichever matches your Product model field for brand ref
      category: category_id || categoryId || null,
    };

    const product = new Product(productData);
    await product.save();

    return res.status(201).json(product);
  } catch (err) {
    console.error("createProduct error:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message || err });
  }
}

async function getProducts(req, res) {
  try {
    const { featured, status, limit } = req.query;
    const q = {};
    if (featured === "true") q.featured = true;
    if (status) q.status = status;
    const query = Product.find(q)
      .populate("brand", "name")
      .sort({ createdAt: -1 });
    if (limit) query.limit(parseInt(limit, 10));
    const products = await query.exec();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getProductBySlug(req, res) {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "brand",
      "name"
    );
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getProductById(req, res) {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).populate("brand", "name");
    if (!product) return res.status(404).json({ message: "Not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
};
