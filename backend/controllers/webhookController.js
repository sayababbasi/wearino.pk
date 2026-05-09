import stripe from "../config/stripe.js";
import { sequelize } from "../config/db.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/**
 * Stripe Webhook Handler
 * 
 * Handles Stripe webhook events, particularly checkout.session.completed.
 * Creates orders, reduces stock, and clears carts after successful payment.
 * 
 * Supports both logged-in users (from cart) and guest users (from metadata).
 * 
 * @route POST /api/payment/webhook
 * @access Public (Stripe webhook)
 */
export const stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ message: "Stripe not configured" });
  }

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const t = await sequelize.transaction();
    
    try {
      const session = event.data.object;
      const userId = session.metadata.userId === 'guest' ? null : parseInt(session.metadata.userId);
      const shippingAddress = session.metadata.shippingAddress 
        ? JSON.parse(session.metadata.shippingAddress) 
        : null;

      let orderItems = [];

      // If logged-in user, get items from cart
      if (userId) {
        const cart = await Cart.findOne({
          where: { userId },
          include: { model: CartItem, include: Product },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (cart && cart.CartItems.length > 0) {
          orderItems = cart.CartItems.map(ci => ({
            productId: ci.productId,
            quantity: ci.quantity,
            price: ci.priceAtAdd,
            product: ci.Product,
          }));
        }
      } else {
        // Guest user - get items from metadata
        if (!session.metadata.items) {
          await t.rollback();
          return res.status(400).json({ message: "Guest orders must include items in metadata" });
        }
        
        const itemsFromMetadata = JSON.parse(session.metadata.items);
        
        // Fetch products to validate and get full product data
        for (const item of itemsFromMetadata) {
          const product = await Product.findByPk(item.productId, { 
            transaction: t, 
            lock: t.LOCK.UPDATE 
          });
          
          if (!product) {
            await t.rollback();
            return res.status(404).json({ message: `Product ${item.productId} not found` });
          }
          
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price || product.price,
            product,
          });
        }
      }

      if (!orderItems.length) {
        await t.rollback();
        return res.status(400).json({ message: "No items found for order" });
      }

      // Calculate total (use session amount as source of truth)
      const total = session.amount_total / 100;

      // Create Order
      const order = await Order.create({
        userId: userId,
        status: "paid",
        total: total,
        shippingAddress: shippingAddress || session.shipping_details?.address || {},
        paymentInfo: { 
          method: 'stripe',
          paymentIntent: session.payment_intent,
          sessionId: session.id,
        },
      }, { transaction: t });

      // Create OrderItems and reduce stock
      for (const item of orderItems) {
        const product = item.product || await Product.findByPk(item.productId, { 
          transaction: t, 
          lock: t.LOCK.UPDATE 
        });
        
        if (!product) {
          await t.rollback();
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }
        
        // Check stock availability
        if (product.stock < item.quantity) {
          await t.rollback();
          return res.status(400).json({ 
            message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}` 
          });
        }
        
        // Reduce stock
        product.stock = product.stock - item.quantity;
        await product.save({ transaction: t });
        
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }, { transaction: t });
      }

      // Clear cart (only for logged-in users)
      if (userId) {
        const cart = await Cart.findOne({ 
          where: { userId },
          transaction: t 
        });
        if (cart) {
          await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
        }
      }

      await t.commit();
      console.log(`Order ${order.id} created successfully from Stripe payment`);
    } catch (error) {
      await t.rollback();
      console.error("Webhook order creation error:", error);
      return res.status(500).json({ message: "Failed to create order from webhook" });
    }
  }

  res.json({ received: true });
};
