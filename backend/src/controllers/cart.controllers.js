const CartItem = require("../models/cart.model.js");

async function getCurrentUserCartItems(req, res) {
  try {
    const items = await CartItem.find({ user: req.user._id }).populate({
      path: "product",
      select: "name price image_url stock_quantity status sizes",
      model: "Product",
    });
    // map to match frontend shape a bit
    const mapped = items.map((item) => ({
      id: item._id,
      product_id: item.product._id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      product: {
        id: item.product._id,
        name: item.product.name,
        price: item.product.price,
        image_url: item.product.image_url,
        stock_quantity: item.product.stock_quantity,
        status: item.product.status,
      },
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function addToCart(req, res) {
  try {
    const { productId, size, color = null, quantity = 1 } = req.body;

    console.log("req",req.body)
    if (!productId || !size)
      return res.status(400).json({ message: "Missing fields" });

    // check if exists
    let item = await CartItem.findOne({
      user: req.user._id,
      product: productId,
      size,
      color,
    });
    if (item) {
      item.quantity = item.quantity + quantity;
      await item.save();
    } else {
      item = new CartItem({
        user: req.user._id,
        product: productId,
        quantity,
        size,
        color,
      });
      await item.save();
      await item.populate({ path: "product", model: "Product" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function updateQuantity(req, res) {
  try {
    const { quantity } = req.body;
    const item = await CartItem.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Not found" });
    if (quantity <= 0) {
      await item.remove();
      return res.json({ success: true });
    }
    item.quantity = quantity;
    await item.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function removeFromCart(req, res) {
  try {
    await CartItem.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

async function clearCart(req, res) {
  try {
    await CartItem.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  getCurrentUserCartItems,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
};
