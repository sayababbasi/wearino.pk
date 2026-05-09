import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post("/", protect, addToWishlist);          // Add product to wishlist
router.get("/", protect, getWishlist);             // Get user wishlist
router.delete("/:productId", protect, removeFromWishlist);  // Remove

export default router;
