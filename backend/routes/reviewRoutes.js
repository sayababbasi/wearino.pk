/**
 * Review Routes
 * Handles customer reviews with purchase verification
 */

import express from "express";
import {
    createReview,
    getProductReviews,
    getUserReviews,
    getPendingReviewProducts,
    updateReview,
    deleteReview,
    adminDeleteReview,
    toggleReviewApproval,
    canUserReview,
    getAllReviews
} from "../controllers/reviewController.js";
import { protect, isAdmin, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/reviews/product/:productId", getProductReviews);

// Authenticated user routes
router.get("/reviews/pending-products", protect, getPendingReviewProducts);
router.get("/reviews/me", protect, getUserReviews);
router.post("/reviews", protect, createReview);
router.put("/reviews/:id", protect, updateReview);
router.delete("/reviews/:id", protect, deleteReview);
router.get("/reviews/can-review/:productId", protect, canUserReview);

// Admin/Manager routes
router.get("/admin/reviews", protect, authorize('admin', 'manager'), getAllReviews);
router.delete("/admin/reviews/:id", protect, authorize('admin', 'manager'), adminDeleteReview);
router.patch("/admin/reviews/:id/toggle-approval", protect, authorize('admin', 'manager'), toggleReviewApproval);

// Legacy/Compat routes (if needed) or just alias
router.patch("/admin/reviews/:id/status", protect, authorize('admin', 'manager'), toggleReviewApproval);

export default router;
