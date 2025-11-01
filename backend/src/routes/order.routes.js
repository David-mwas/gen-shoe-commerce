const express = require("express");
const { authMiddleware } = require("../middleware/auth.js");
const Order = require("../models/order.model.js");

const { sendMail } = require("../lib/mailer.js");

const router = express.Router();

// Create order (requires auth)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      order_number,
      total_amount,
      payment_method,
      payment_status = "pending",
      shipping_address,
      customer_phone,
      customer_email,
      items = [],
      notes,
    } = req.body;

    if (!order_number || !total_amount || !payment_method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = new Order({
      user: req.user._id,
      order_number,
      total_amount,
      payment_method,
      payment_status,
      shipping_address,
      customer_phone,
      customer_email,
      items,
      notes,
    });

    await order.save();
    // //////////////////////
    // send order email confirmation
    const recipient = order.customer_email || (req.user && req.user.email);
    if (recipient) {
      const html = `
        <p>Hi ${req.user?.full_name || ""},</p>
        <p>Thanks for your order <strong>${order.order_number}</strong>.</p>
        <p>Total: KSh ${order.total_amount}</p>
        <p>We'll notify you when it ships.</p>
        <h2>Best regards, ShoeStore</h2>
      `;
      sendMail({
        to: recipient,
        subject: `Order confirmation — ${order.order_number}`,
        text: `Thanks for your order ${order.order_number}`,
        html,
      }).catch((err) => console.error("Order confirmation email failed:", err));
    }
    // /////////////////////
    return res.json(order);
  } catch (err) {
    console.error("Create order error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all orders for current user (or admin all orders)
router.get("/", authMiddleware, async (req, res) => {
  try {
    // if admin return all orders
    if (req.user.role === process.env.USER_ROLE) {
      const all = await Order.find().sort({ createdAt: -1 });
      return res.json(all);
    }

    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    console.error("Get orders error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single order (owner or admin)
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== process.env.USER_ROLE &&
      (!order.user || order.user.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(order);
  } catch (err) {
    console.error("Get order error", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update order (owner or admin) - used to save payment_details or change status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      req.user.role !== process.env.USER_ROLE &&
      (!order.user || order.user.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Only update allowed fields
    const allowed = [
      "status",
      "payment_status",
      "payment_details",
      "notes",
      "shipping_address",
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) order[field] = req.body[field];
    });

    await order.save();
    res.json(order);
  } catch (err) {
    console.error("Update order error", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
