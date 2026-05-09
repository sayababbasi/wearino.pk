/**
 * Coupon Routes
 * Handles admin coupon management and customer coupon validation
 */

import express from "express";
import {
    getAllCoupons,
    getCouponById,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon
} from "../controllers/couponController.js";
import { protect, isAdmin, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin routes - require authentication and admin role
router.get("/admin/coupons", protect, isAdmin, getAllCoupons);
router.get("/admin/coupons/:id", protect, isAdmin, getCouponById);
router.post("/admin/coupons", protect, isAdmin, createCoupon);
router.put("/admin/coupons/:id", protect, isAdmin, updateCoupon);
router.delete("/admin/coupons/:id", protect, isAdmin, deleteCoupon);

// Customer-facing route - validate coupon code
router.post("/coupons/validate", validateCoupon);

// Customer-facing route - validate coupon code

export default router;
