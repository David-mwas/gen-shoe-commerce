// src/routes/payments.js
const express = require("express");
const {authMiddleware} = require("../middleware/auth.js");
const Order = require("../models/order.model.js");

const router = express.Router();

const MPESA_MODE = process.env.MPESA_MODE || "mock";
const MPESA_TILL_NUMBER = process.env.MPESA_TILL_NUMBER || "000000";
const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL || null;

let mpesaLib;
if (MPESA_MODE === "real") {
  mpesaLib = require("../lib/mpesa.js");
}

/**
 * POST /api/payments/mpesa
 * Body: { orderId, phone, amount }
 * - Mock: returns instructional object (persisted to order.payment_details)
 * - Real: returns instructions (till + order ref). Confirmations will come via Daraja callbacks.
 */
router.post("/mpesa", authMiddleware, async (req, res) => {
  try {
    const { orderId, phone, amount } = req.body;
    if (!orderId || !phone || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure owner or admin
    if (
      !req.user.is_admin &&
      order.user &&
      order.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (MPESA_MODE === "mock") {
      const mock = {
        success: true,
        type: "mock",
        instructions: `Please pay KSh ${amount} to Till ${MPESA_TILL_NUMBER}. Use reference: ${order.order_number}`,
        tillNumber: MPESA_TILL_NUMBER,
        reference: `TILL-${Date.now()}`,
        amount,
        phone,
        expires_in: 60 * 60,
      };

      order.payment_details = mock;
      await order.save();

      return res.json(mock);
    }

    // ---------- REAL mode ----------
    if (!mpesaLib)
      return res.status(500).json({ message: "MPESA library not initialized" });

    // Prefer using order_number as reference to match confirmations
    const instructions = {
      success: true,
      type: "daraja",
      instructions: `Please pay KSh ${amount} to Till ${MPESA_TILL_NUMBER}. Use reference: ${order.order_number}`,
      tillNumber: MPESA_TILL_NUMBER,
      orderRef: order.order_number,
      amount,
      phone,
    };

    // Persist the instructions so frontend can display them while waiting for confirmation
    order.payment_details = {
      initiatedAt: new Date(),
      method: "mpesa_till",
      details: instructions,
    };
    order.payment_status = "pending";
    await order.save();

    // Return instructions to frontend
    return res.json(instructions);
  } catch (err) {
    console.error("MPESA POST error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/payments/mpesa/register
 * Calls Daraja registerurl to register Validation & Confirmation URLs for the configured Till.
 * OPTIONAL - useful for sandbox/dev. Requires MPESA_MODE=real and PUBLIC_BASE_URL set.
 */
router.post("/mpesa/register", authMiddleware, async (req, res) => {
  try {
    if (!req.user.is_admin)
      return res.status(403).json({ message: "Admin only" });
    if (MPESA_MODE !== "real")
      return res.status(400).json({ message: "MPESA_MODE must be real" });
    if (!PUBLIC_BASE_URL)
      return res.status(400).json({ message: "PUBLIC_BASE_URL not set" });

    const confirmationURL = `${PUBLIC_BASE_URL}/api/payments/mpesa/confirmation`;
    const validationURL = `${PUBLIC_BASE_URL}/api/payments/mpesa/validation`;

    const result = await mpesaLib.registerC2BUrls({
      shortCode: MPESA_TILL_NUMBER,
      confirmationURL,
      validationURL,
    });

    return res.json({ success: true, result });
  } catch (err) {
    console.error(
      "Register C2B URLs error",
      err.response?.data || err.message || err
    );
    return res.status(500).json({
      message: "Failed to register URLs",
      error: err.response?.data || err.message,
    });
  }
});

/**
 * POST /api/payments/mpesa/validation
 * Safaricom calls this to validate a payment (C2B). We accept and respond with ResultCode 0 to accept.
 * You might perform validation checks here (amount matches order etc).
 */
router.post("/mpesa/validation", async (req, res) => {
  try {
    // req.body structure depends on Daraja. We accept and return ResultCode:0
    // Example body: { TransactionType, TransID, TransTime, TransAmount, BusinessShortCode, BillRefNumber, .... }
    const body = req.body;
    console.log("C2B Validation received:", body);

    // Optional: try to validate that BillRefNumber corresponds to an order_number and amounts match.
    // We'll accept for now:
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("Validation handler error", err);
    return res.json({ ResultCode: 1, ResultDesc: "Rejected" });
  }
});

/**
 * POST /api/payments/mpesa/confirmation
 * Safaricom calls this to notify of a successful payment.
 * We'll update the corresponding order (find by BillRefNumber or by matching amount & MSISDN if needed).
 */
router.post("/mpesa/confirmation", async (req, res) => {
  try {
    const body = req.body;
    console.log("C2B Confirmation received:", JSON.stringify(body, null, 2));

    /**
     * Daraja confirmation payload (example keys you may see):
     * - TransID or TransactionID
     * - TransactionType
     * - TransTime
     * - TransAmount
     * - BusinessShortCode
     * - BillRefNumber (this can hold the order reference)
     * - MSISDN (payer phone)
     * - FirstName, MiddleName, LastName
     *
     * We'll try to locate the order by BillRefNumber === order_number.
     */
    const details = body; // store raw

    const billRef = body?.BillRefNumber || body?.billRefNumber || body?.BillRef;
    const transAmount = parseFloat(
      body?.TransAmount || body?.transAmount || body?.Amount || 0
    );
    const msisdn = body?.MSISDN || body?.msisdn || body?.MSISDN;

    let order = null;
    if (billRef) {
      order = await Order.findOne({ order_number: billRef });
    }

    // fallback: try match by amount & user phone (best-effort)
    if (!order && msisdn && transAmount) {
      order = await Order.findOne({
        total_amount: transAmount,
        customer_phone: { $regex: msisdn.replace(/^0/, ""), $options: "i" }, // naive
      });
    }

    if (!order && body?.TransactionType) {
      // Last resort: match by other heuristics (not implemented)
      console.warn(
        "Confirmation: could not find order for billRef / amount / msisdn"
      );
    }

    if (order) {
      order.payment_status = "completed";
      order.status = order.status === "pending" ? "paid" : order.status;
      order.payment_details = {
        ...order.payment_details,
        confirmation: details,
        confirmedAt: new Date(),
      };
      await order.save();
      console.log(`Order ${order._id} marked as paid via M-Pesa`);
    } else {
      console.warn(
        "Confirmation received but no matching order found. Storing as orphan record not implemented."
      );
      // Optionally, create a log collection for orphan confirmations
    }

    // Daraja expects a simple response acknowledging receipt
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("MPESA confirmation handler error", err);
    return res
      .status(500)
      .json({ ResultCode: 1, ResultDesc: "Internal Error" });
  }
});

module.exports = router;
