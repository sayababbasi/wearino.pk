import express from "express";
import {
  getTopViewedProducts,
  getCounts,
  getRevenueAnalytics
} from "../controllers/analyticsController.js";

import { protect, isAdmin } from "../middleware/authMiddleware.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

// Admin analytics
router.get("/top-viewed", protect, isAdmin, cacheMiddleware(60), getTopViewedProducts);
router.get("/counts", protect, isAdmin, cacheMiddleware(60), getCounts);
router.get("/revenue", protect, isAdmin, cacheMiddleware(60), getRevenueAnalytics);

export default router;
