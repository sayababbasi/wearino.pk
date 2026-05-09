import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  getMonthlyStats,
  cancelOrderItem,
  trackOrder
} from "../controllers/orderController.js";
import { protect, isAdmin, authorize, optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order (Authenticated or Guest)
router.post("/", optionalAuth, createOrder);

// Get orders (Authenticated - Relaxed Role)
router.get("/", protect, getOrders);

// Get Monthly Stats (Admin only)
router.get("/stats/monthly", protect, isAdmin, getMonthlyStats);

// Public Order Tracking
router.get("/track/:id", trackOrder);

// Get Order By ID
router.get("/:id", optionalAuth, getOrderById);

// Update Status (Admin only)
router.put("/:id/status", protect, isAdmin, updateOrderStatus);
router.delete("/:orderId/items/:itemId", protect, isAdmin, cancelOrderItem);
router.put("/:id/deliver", protect, isAdmin, updateOrderStatus);

// Update Payment Status (Admin only)
router.put("/:id/payment-status", protect, isAdmin, updatePaymentStatus);
router.put("/:id/pay", protect, isAdmin, updatePaymentStatus);

export default router;
