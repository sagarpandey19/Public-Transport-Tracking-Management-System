const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  validateCoupon,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");

const router = express.Router();

// Public-ish: any logged-in user can validate
router.post("/validate", protect, validateCoupon);

// Admin only
router.get("/", protect, authorize("admin"), listCoupons);
router.post("/", protect, authorize("admin"), createCoupon);
router.put("/:id", protect, authorize("admin"), updateCoupon);
router.delete("/:id", protect, authorize("admin"), deleteCoupon);

module.exports = router;
