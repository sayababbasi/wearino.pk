import stripe from "../config/stripe.js";
import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const createCheckoutSession = asyncHandler(async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe not configured" });
  }

  const { items, shippingAddress } = req.body;
  // items: array of { productId, quantity, price } for both logged-in and guest users

  let lineItems = [];

  // If user is logged in, try to get items from cart
  if (req.user) {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: { model: CartItem, include: Product },
    });

    if (cart && cart.CartItems.length > 0) {
      lineItems = cart.CartItems.map(item => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.Product.name,
            description: item.Product.description || "",
            images: item.Product.image ? [item.Product.image] : [],
          },
          unit_amount: Math.round(item.priceAtAdd * 100), // cents
        },
        quantity: item.quantity,
      }));
    }
  }

  // If no cart items or guest user, use items from request body
  if (lineItems.length === 0 && items && items.length > 0) {
    // Fetch products to get names and images
    const productIds = items.map(item => item.productId);
    const products = await Product.findAll({
      where: { id: productIds },
    });

    const productMap = {};
    products.forEach(p => { productMap[p.id] = p; });

    lineItems = items.map(item => {
      const product = productMap[item.productId];
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product?.name || "Product",
            description: product?.description || "",
            images: product?.image ? [product.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // cents
        },
        quantity: item.quantity,
      };
    });
  }

  if (lineItems.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  // Prepare metadata (include items for guest users)
  const metadata = { 
    userId: req.user?.id?.toString() || 'guest',
    shippingAddress: JSON.stringify(shippingAddress),
  };
  
  // For guest users, include items in metadata so webhook can process them
  if (!req.user && items && items.length > 0) {
    metadata.items = JSON.stringify(items);
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orderReceipt?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/cart`,
    metadata: metadata,
    shipping_address_collection: {
      allowed_countries: ['US', 'CA', 'GB', 'AU'],
    },
  });

  res.json({ success: true, id: session.id });
});
