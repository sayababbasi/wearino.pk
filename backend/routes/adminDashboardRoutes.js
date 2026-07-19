import express from "express";
import {
  getAdminStats,
  getMonthlyUserStats,
  getMonthlyProductStats,
  getLatestUsers,
  getLatestInquiries,
  getLowStockProducts,
  getMostWishlisted
} from "../controllers/adminDashboardController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

router.get("/stats", protect, isAdmin, cacheMiddleware(60), getAdminStats);
router.get("/charts/users", protect, isAdmin, cacheMiddleware(60), getMonthlyUserStats);
router.get("/charts/products", protect, isAdmin, cacheMiddleware(60), getMonthlyProductStats);
router.get("/latest/users", protect, isAdmin ,  getLatestUsers);
router.get("/latest/inquiries", protect, isAdmin, getLatestInquiries);
router.get("/products/low-stock", protect, isAdmin, getLowStockProducts);
router.get("/products/most-wishlisted", protect, isAdmin, getMostWishlisted);

export default router;
