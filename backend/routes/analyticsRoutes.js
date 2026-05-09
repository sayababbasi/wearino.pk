import express from "express";
import {
  getTopViewedProducts,
  getCounts,
  getRevenueAnalytics
} from "../controllers/analyticsController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin analytics
router.get("/top-viewed", protect, isAdmin, getTopViewedProducts);
router.get("/counts", protect, isAdmin, getCounts);
router.get("/revenue", protect, isAdmin, getRevenueAnalytics);

export default router;
