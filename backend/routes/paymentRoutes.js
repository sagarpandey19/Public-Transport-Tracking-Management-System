const express = require("express");
const router = express.Router();

const { createOrder, verifyPayment, getKey } = require("../controllers/paymentController");

// Get Razorpay Key
router.get("/key", getKey);

// Create Order (generating order_id)
router.post("/create-order", createOrder);

// Verify Signature and Save Booking
router.post("/verify", verifyPayment);

module.exports = router;
