const Coupon = require("../models/Coupon");

// Validate a coupon code (any authenticated user)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, totalFare, seatCount } = req.body;

    if (!code) return res.status(400).json({ message: "Coupon code is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

    if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
    if (!coupon.isActive) return res.status(400).json({ message: "This coupon is no longer active" });
    if (new Date() > new Date(coupon.expiryDate)) return res.status(400).json({ message: "This coupon has expired" });
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "This coupon has reached its usage limit" });
    }
    if (totalFare && coupon.minBookingAmount > 0 && totalFare < coupon.minBookingAmount) {
      return res.status(400).json({ message: `Minimum booking amount is ₹${coupon.minBookingAmount}` });
    }
    if (seatCount && coupon.minSeats && seatCount < coupon.minSeats) {
      return res.status(400).json({ message: `This coupon requires at least ${coupon.minSeats} seats` });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = Math.round((totalFare * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    // Ensure final price is at least ₹1
    const finalPrice = Math.max(1, totalFare - discount);
    discount = totalFare - finalPrice;

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      finalPrice,
      couponId: coupon._id,
      tag: coupon.tag,
    });
  } catch (err) {
    console.error("validateCoupon error:", err);
    res.status(500).json({ message: "Failed to validate coupon" });
  }
};

// List all coupons (admin)
exports.listCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch coupons" });
  }
};

// Create coupon (admin)
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }
    console.error("createCoupon error:", err);
    res.status(500).json({ message: "Failed to create coupon" });
  }
};

// Update coupon (admin)
exports.updateCoupon = async (req, res) => {
  try {
    const updated = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Coupon not found" });
    res.json(updated);
  } catch (err) {
    console.error("updateCoupon error:", err);
    res.status(500).json({ message: "Failed to update coupon" });
  }
};

// Delete coupon (admin)
exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("deleteCoupon error:", err);
    res.status(500).json({ message: "Failed to delete coupon" });
  }
};
