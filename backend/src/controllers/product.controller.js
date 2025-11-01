const Product = require("../models/product.model.js");
const CartItem = require("../models/cart.model.js");
const Order = require("../models/order.model.js");
const cloudinary = require("../lib/cloudinary.js");
const { default: mongoose } = require("mongoose");

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
      image_public_id: req.body.image_public_id || null,
      transparent_url: req.body.transparent_url || null,
      images: Array.isArray(images) ? images : [],
      images_public_ids: Array.isArray(req.body.images_public_ids)
        ? req.body.images_public_ids
        : [],
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

async function deleteProduct(req, res) {
  // const { id } = req.params;
  // const productIdStr = String(id);

  // // start a session for a transaction if possible
  // let session;
  // try {
  //   session = await mongoose.startSession();
  // } catch (e) {
  //   session = null;
  // }

  // // helper to run fallback cleanup if transaction fails or unsupported
  // async function fallbackCleanup() {
  //   // best-effort cleanup without transaction
  //   const deleted = await Product.findByIdAndDelete(productIdStr).exec();
  //   if (!deleted)
  //     return { deleted: null, cartDeletedCount: 0, updatedOrders: [] };

  //   const cartDel = await CartItem.deleteMany({ product: productIdStr }).exec();

  //   const ordersWithProduct = await Order.find({
  //     "items.product_id": productIdStr,
  //   }).exec();
  //   const updatedOrders = [];

  //   for (const order of ordersWithProduct) {
  //     // remove items referencing this product
  //     order.items = order.items.filter(
  //       (it) => String(it.product_id) !== productIdStr
  //     );

  //     // recalc total (use stored price in order item)
  //     order.total_amount = order.items.reduce((sum, it) => {
  //       const price = Number(it.price || 0);
  //       const qty = Number(it.quantity || 1);
  //       return sum + price * qty;
  //     }, 0);

  //     // optional: if order.items.length === 0 you might cancel it
  //     // if (order.items.length === 0) order.status = "cancelled";

  //     await order.save();
  //     updatedOrders.push({
  //       orderId: order._id,
  //       remainingItems: order.items.length,
  //       newTotal: order.total_amount,
  //     });
  //   }

  //   return { deleted, cartDeletedCount: cartDel.deletedCount, updatedOrders };
  // }

  // // Try transaction first (preferred)
  // if (session && session.startTransaction) {
  //   try {
  //     session.startTransaction();

  //     // 1) delete product
  //     const deleted = await Product.findByIdAndDelete(productIdStr, {
  //       session,
  //     }).exec();
  //     if (!deleted) {
  //       await session.abortTransaction();
  //       session.endSession();
  //       return res.status(404).json({ message: "Product not found" });
  //     }

  //     // 2) delete cart items referencing product (product is ObjectId in CartItem)
  //     const cartDel = await CartItem.deleteMany(
  //       { product: productIdStr },
  //       { session }
  //     ).exec();

  //     // 3) find orders that include this product_id and update them
  //     const ordersWithProduct = await Order.find(
  //       { "items.product_id": productIdStr },
  //       null,
  //       { session }
  //     ).exec();
  //     const updatedOrders = [];

  //     for (const order of ordersWithProduct) {
  //       order.items = order.items.filter(
  //         (it) => String(it.product_id) !== productIdStr
  //       );

  //       order.total_amount = order.items.reduce((sum, it) => {
  //         const price = Number(it.price || 0);
  //         const qty = Number(it.quantity || 1);
  //         return sum + price * qty;
  //       }, 0);

  //       // optionally cancel empty orders:
  //       // if (order.items.length === 0) order.status = "cancelled";

  //       await order.save({ session });
  //       updatedOrders.push({
  //         orderId: order._id,
  //         remainingItems: order.items.length,
  //         newTotal: order.total_amount,
  //       });
  //     }

  //     await session.commitTransaction();
  //     session.endSession();

  //     return res.json({
  //       message: "Product deleted successfully",
  //       productId: deleted._id,
  //       deletedFromCarts: cartDel.deletedCount,
  //       updatedOrders,
  //     });
  //   } catch (txErr) {
  //     console.error("Transaction delete error:", txErr);
  //     try {
  //       await session.abortTransaction();
  //       session.endSession();
  //     } catch (e) {
  //       console.error("Failed to abort transaction:", e);
  //     }

  //     // fallback best-effort
  //     try {
  //       const fallback = await fallbackCleanup();
  //       if (!fallback.deleted) {
  //         return res
  //           .status(404)
  //           .json({ message: "Product not found (fallback)" });
  //       }
  //       return res.json({
  //         message: "Product deleted (fallback cleanup)",
  //         productId: fallback.deleted._id,
  //         deletedFromCarts: fallback.cartDeletedCount,
  //         updatedOrders: fallback.updatedOrders,
  //         note: "Transaction failed; applied best-effort fallback cleanup",
  //       });
  //     } catch (fallbackErr) {
  //       console.error("Fallback cleanup error:", fallbackErr);
  //       return res.status(500).json({
  //         message: "Server error during delete",
  //         error: txErr.message || txErr,
  //       });
  //     }
  //   }
  // } else {
  //   // no transaction support — just do fallback
  //   try {
  //     const fallback = await fallbackCleanup();
  //     if (!fallback.deleted) {
  //       return res.status(404).json({ message: "Product not found" });
  //     }
  //     return res.json({
  //       message: "Product deleted (no transaction available)",
  //       productId: fallback.deleted._id,
  //       deletedFromCarts: fallback.cartDeletedCount,
  //       updatedOrders: fallback.updatedOrders,
  //     });
  //   } catch (err) {
  //     console.error("Non-transactional delete error:", err);
  //     return res.status(500).json({
  //       message: "Server error during delete",
  //       error: err.message || err,
  //     });
  //   }
  // }

  const { id } = req.params;

  // helper to derive public_id from URL (your existing helper)
  function extractPublicIdFromUrl(url) {
    if (!url || typeof url !== "string") return null;
    const idx = url.indexOf("/upload/");
    if (idx === -1) return null;
    let after = url.slice(idx + "/upload/".length);
    after = after.split("?")[0];
    const vMatch = after.match(/^v\d+\//);
    if (vMatch) after = after.slice(vMatch[0].length);
    const firstSeg = after.split("/")[0];
    if (/[,_=]/.test(firstSeg)) {
      after = after.split("/").slice(1).join("/");
    }
    const lastDot = after.lastIndexOf(".");
    if (lastDot !== -1) after = after.slice(0, lastDot);
    return after;
  }

  async function deleteCloudinaryById(publicId) {
    try {
      if (!publicId) return { ok: false, reason: "no-public-id" };
      const r = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
      });
      return { ok: true, result: r };
    } catch (err) {
      console.error("Cloudinary destroy failed", publicId, err);
      return { ok: false, error: err.message || String(err) };
    }
  }

  let session;
  try {
    // load product first (outside transaction) to gather public ids & other metadata
    const product = await Product.findById(id).lean().exec();
    if (!product) return res.status(404).json({ message: "Product not found" });

    // collect Cloudinary public ids to attempt delete later
    const toDeletePublicIds = new Set();

    if (product.image_public_id) toDeletePublicIds.add(product.image_public_id);
    if (product.transparent_url) {
      const pid = product.image_public_id
        ? `${product.image_public_id}_transparent`
        : extractPublicIdFromUrl(product.transparent_url);
      if (pid) toDeletePublicIds.add(pid);
    }
    if (!product.image_public_id && product.image_url) {
      const pid = extractPublicIdFromUrl(product.image_url);
      if (pid) toDeletePublicIds.add(pid);
    }

    if (
      Array.isArray(product.images_public_ids) &&
      product.images_public_ids.length
    ) {
      product.images_public_ids.forEach((p) => p && toDeletePublicIds.add(p));
    } else if (Array.isArray(product.images) && product.images.length) {
      for (const url of product.images) {
        const pid = extractPublicIdFromUrl(url);
        if (pid) toDeletePublicIds.add(pid);
      }
    }

    // Start mongoose session & transaction
    session = await mongoose.startSession();

    let transactionResults = {
      product_deleted: false,
      carts_deleted: 0,
      orders_updated: 0,
    };

    // Check whether the server supports transactions (replica set). If not, warn & fallback to non-transactional ops.
    let inTransaction = true;
    try {
      await session.withTransaction(
        async () => {
          // Delete the product document
          const deleted = await Product.findByIdAndDelete(id, {
            session,
          }).exec();
          if (!deleted) {
            // abort transaction by throwing
            throw new Error("Product not found during transaction");
          }
          transactionResults.product_deleted = true;

          // Delete cart items referencing this product
          const cartRes = await CartItem.deleteMany(
            { product: id },
            { session }
          ).exec();
          transactionResults.carts_deleted = cartRes.deletedCount || 0;

          // Find orders that contain items with this product_id string
          const orders = await Order.find({ "items.product_id": id }, null, {
            session,
          }).exec();

          for (const order of orders) {
            // Remove items that reference the product
            const originalCount = order.items.length;
            order.items = order.items.filter(
              (it) => String(it.product_id) !== String(id)
            );
            // Recalculate total (simple sum of price * quantity)
            order.total_amount = order.items.reduce(
              (sum, it) =>
                sum + Number(it.price || 0) * Number(it.quantity || 1),
              0
            );
            // Optionally change status if no items left — keeping commented
            // if (order.items.length === 0) order.status = 'cancelled';
            await order.save({ session });
            if (order.items.length !== originalCount)
              transactionResults.orders_updated++;
          }
        },
        {
          readConcern: { level: "local" },
          writeConcern: { w: "majority" },
          readPreference: "primary",
        }
      );
    } catch (txErr) {
      // If calling withTransaction throws because server doesn't support transactions, fallback
      console.warn(
        "Transaction failed or unsupported:",
        txErr && txErr.message
      );
      // Try fallback non-transactional approach
      inTransaction = false;
      await session.endSession();
      session = null;

      // Non-transactional fallback (best-effort)
      // Delete product
      const deleted = await Product.findByIdAndDelete(id).exec();
      if (!deleted)
        return res
          .status(404)
          .json({ message: "Product not found (fallback)" });
      transactionResults.product_deleted = true;

      // Delete cart items
      const cartRes = await CartItem.deleteMany({ product: id }).exec();
      transactionResults.carts_deleted = cartRes.deletedCount || 0;

      // Update orders
      const orders = await Order.find({ "items.product_id": id }).exec();
      for (const order of orders) {
        const originalCount = order.items.length;
        order.items = order.items.filter(
          (it) => String(it.product_id) !== String(id)
        );
        order.total_amount = order.items.reduce(
          (sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 1),
          0
        );
        await order.save();
        if (order.items.length !== originalCount)
          transactionResults.orders_updated++;
      }
    } finally {
      if (session) {
        try {
          await session.endSession();
        } catch (e) {
          /* ignore */
        }
      }
    }

    // At this point DB changes are committed (either via transaction or fallback).
    // Now delete Cloudinary assets (best-effort).
    const cloudResults = [];
    for (const pid of Array.from(toDeletePublicIds)) {
      // attempt delete, push result
      const result = await deleteCloudinaryById(pid);
      cloudResults.push({ public_id: pid, ...result });
    }

    return res.json({
      message: "Product deleted (DB changes committed)",
      transaction: inTransaction ? "committed" : "fallback_no_transaction",
      db: transactionResults,
      cloudinary: cloudResults,
    });
  } catch (err) {
    console.error("Delete product error:", err);
    // If session still active, try to abort
    try {
      if (session) {
        await session.abortTransaction();
        await session.endSession();
      }
    } catch (e) {
      // ignore
    }
    return res
      .status(500)
      .json({ message: "Server error", error: err.message || String(err) });
  }
}

// get aggregate sizes
async function getDistinctSizes(req, res) {
  try {
    const agg = [
      // Project `sizes` as an array in all cases:
      {
        $project: {
          sizes: {
            $cond: [
              // if sizes is already an array -> keep it
              { $eq: [{ $type: "$sizes" }, "array"] },
              "$sizes",
              // else if sizes is a non-empty string -> split by comma
              {
                $cond: [
                  {
                    $and: [
                      { $ne: ["$sizes", null] },
                      { $eq: [{ $type: "$sizes" }, "string"] },
                    ],
                  },
                  {
                    $map: {
                      input: { $split: ["$sizes", ","] },
                      as: "s",
                      in: { $trim: { input: "$$s" } },
                    },
                  },
                  [],
                ],
              },
            ],
          },
        },
      },

      // Unwind the sizes array so we can group/dedupe
      { $unwind: "$sizes" },

      // Remove empty strings (safety)
      { $match: { sizes: { $ne: "" } } },

      // Group unique sizes
      { $group: { _id: null, sizes: { $addToSet: "$sizes" } } },

      // Project the array
      { $project: { _id: 0, sizes: 1 } },
    ];

    const result = await Product.aggregate(agg).exec();
    let sizes = (result[0] && result[0].sizes) || [];

    // numeric-aware sort: if all items look numeric, sort numerically (so "35","40","42" sort OK)
    const allNumeric =
      sizes.length > 0 && sizes.every((s) => /^-?\d+(\.\d+)?$/.test(String(s)));
    if (allNumeric) {
      sizes = sizes
        .map((s) => ({ n: Number(s), raw: String(s) }))
        .sort((a, b) => a.n - b.n)
        .map((x) => x.raw);
    } else {
      sizes.sort((a, b) =>
        String(a).localeCompare(String(b), undefined, { numeric: true })
      );
    }

    return res.json({ sizes });
  } catch (err) {
    console.error("getDistinctSizes error", err);
    return res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  createProduct,
  getProducts,
  getProductBySlug,
  getProductById,
  deleteProduct,
  getDistinctSizes,
};
