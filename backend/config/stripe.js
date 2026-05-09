import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

// Only initialize Stripe if API key is provided
let stripe = null;

if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} else {
  console.warn("⚠️  STRIPE_SECRET_KEY not set. Stripe features will be disabled.");
}

export default stripe;
