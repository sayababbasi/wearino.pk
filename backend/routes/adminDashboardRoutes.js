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

const router = express.Router();

router.get("/stats", protect, isAdmin, getAdminStats);
router.get("/charts/users", protect, isAdmin, getMonthlyUserStats);
router.get("/charts/products", protect, isAdmin, getMonthlyProductStats);
router.get("/latest/users", protect, isAdmin ,  getLatestUsers);
router.get("/latest/inquiries", protect, isAdmin, getLatestInquiries);
router.get("/products/low-stock", protect, isAdmin, getLowStockProducts);
router.get("/products/most-wishlisted", protect, isAdmin, getMostWishlisted);

export default router;
