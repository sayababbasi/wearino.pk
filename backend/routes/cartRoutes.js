import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Use optionalAuth to support both logged-in and guest users
router.use(optionalAuth);

router.get("/", getCart);
router.post("/", addToCart); // body: { productId, quantity }
router.put("/item/:cartItemId", updateCartItem); // body: { quantity }
router.delete("/item/:cartItemId", removeCartItem);
router.delete("/", clearCart);

export default router;
