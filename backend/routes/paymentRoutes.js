import express from "express";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { createCheckoutSession } from "../controllers/paymentController.js";
import { stripeWebhook } from "../controllers/webhookController.js";
import bodyParser from "body-parser";

const router = express.Router();

// Checkout session - supports both logged-in and guest users
router.post("/create-checkout-session", optionalAuth, createCheckoutSession);

// Stripe webhook
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
