const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ["percentage", "flat"], required: true },
  discountValue: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  minBookingAmount: { type: Number, default: 0 },
  tag: { type: String, default: null, enum: [null, "SUMMER", "FESTIVE", "COMBO", "SOLO", "WELCOME"] },
  minSeats: { type: Number, default: null },
  maxDiscount: { type: Number, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);
