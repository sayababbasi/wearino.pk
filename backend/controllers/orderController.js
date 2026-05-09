import { sequelize } from "../config/db.js";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { shippingAddress, paymentMethod, items, orderNumber: requestedOrderNumber, couponCode, couponDiscount } = req.body;

    let orderItems = [];

    // 1. Try to get items from DB Cart (if user logged in)
    if (req.user) {
      const cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: [{ model: CartItem, include: [Product] }],
        transaction: t
      });

      if (cart && cart.CartItems && cart.CartItems.length > 0) {
        orderItems = cart.CartItems.map(ci => ({
          productId: ci.productId,
          quantity: ci.quantity,
          price: ci.priceAtAdd || ci.Product?.price || 0,
          selectedSize: ci.selectedSize || null,
          selectedColor: ci.selectedColor || null,
        }));
      }
    }

    // 2. Fallback: If no items from DB (Guest OR Empty DB Cart), use request body
    if (orderItems.length === 0) {
      if (!items || items.length === 0) {
        await t.rollback();
        return res.status(400).json({ message: "Cart is empty (No items provided)" });
      }

      // Process items from body (Guest or Fallback)
      for (const item of items) {
        const product = await Product.findByPk(item.productId, { transaction: t });
        if (!product) {
          await t.rollback();
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
        });
      }
    }

    // calculate subtotal
    const subtotal = orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    // final total after discount
    const discountAmount = couponDiscount || 0;
    const total = Math.max(0, subtotal - discountAmount);

    // Generate sequential order number in #W-XXX format
    const orderCount = await Order.count({ transaction: t });
    const nextOrderNumber = orderCount + 1;
    const formattedOrderNumber = `#W-${String(nextOrderNumber).padStart(3, '0')}`;

    // Create order
    const order = await Order.create(
      {
        userId: req.user?.id || null, // null for guest users
        status: paymentMethod === "cod" ? "pending" : "paid",
        total,
        subtotal,
        couponCode: couponCode || null,
        couponDiscount: discountAmount,
        shippingAddress,
        paymentInfo: { method: paymentMethod },
        orderNumber: formattedOrderNumber,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid"
      },
      { transaction: t }
    );

    // create order items and reduce stock
    for (const item of orderItems) {
      // Stock fetch for future implementation but logging for now
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (product) {
        // console.log(`[createOrder] Current stock for ${product.name}: ${product.stock}`);
      }

      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        },
        { transaction: t }
      );
    }

    // Increment coupon usage count if a coupon was applied
    if (req.body.couponCode) {
      const coupon = await Coupon.findOne({
        where: { code: req.body.couponCode.toUpperCase() },
        transaction: t
      });

      if (coupon) {
        coupon.usageCount = (coupon.usageCount || 0) + 1;
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          coupon.isActive = false;
        }
        await coupon.save({ transaction: t });
      }
    }

    // clear cart (only for logged-in users)
    if (req.user) {
      const cart = await Cart.findOne({
        where: { userId: req.user.id },
        transaction: t
      });
      if (cart) {
        await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
      }
    }

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: {
            model: Product,
            attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
          }
        }
      ]
    });
    res.json({ success: true, order: fullOrder });
  } catch (err) {
    if (t) await t.rollback();
    console.error("[createOrder] FATAL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const where = {};
    if (req.user && req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    const orders = await Order.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: {
            model: Product,
            attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
          }
        }
      ],
      order: [['createdAt', 'DESC']],
    });
    console.log(`Found ${orders.length} orders`);

    // Log sample order item to verify data structure
    if (orders.length > 0 && orders[0].OrderItems && orders[0].OrderItems.length > 0) {
      console.log("Sample OrderItem data:", JSON.stringify({
        productId: orders[0].OrderItems[0].productId,
        productName: orders[0].OrderItems[0].Product?.name,
        images: orders[0].OrderItems[0].Product?.images,
        selectedSize: orders[0].OrderItems[0].selectedSize,
        selectedColor: orders[0].OrderItems[0].selectedColor,
      }, null, 2));
    }

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    let order;

    // Try finding by PK (if numeric) or orderNumber (string)
    if (!isNaN(id)) {
      order = await Order.findByPk(id, {
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          {
            model: OrderItem,
            include: {
              model: Product,
              attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
            }
          }
        ]
      });
    }

    // If not found by PK or if ID is a string, try orderNumber
    if (!order) {
      // Handle both #W-001 and W-001 formats
      const targetOrderNumber = id.startsWith('#') ? id : `#${id}`;

      order = await Order.findOne({
        where: { orderNumber: targetOrderNumber },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          {
            model: OrderItem,
            include: {
              model: Product,
              attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
            }
          }
        ]
      });
    }

    if (!order) return res.status(404).json({ message: "Not found" });

    // Access Control
    // 1. Admin: Allow full access
    if (req.user && req.user.role === 'admin') {
      return res.json(order);
    }

    // 2. Owner (Logged in): Allow if userId matches
    if (req.user && order.userId === req.user.id) {
      return res.json(order);
    }

    // 3. Guest/Public: Allow ONLY if accessed via unique orderNumber (acting as secret key)
    // We disallow guessing numeric IDs (e.g. /order/1) for strangers
    // id in req.params would be the orderNumber in this case
    if (order.orderNumber === id) {
      return res.json(order);
    }

    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // if (!['admin', 'manager', 'assistant'].includes(req.user.role)) return res.status(403).json({ message: "Not authorized" });

    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: {
            model: Product,
            attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
          }
        }
      ],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Not found" });
    }

    // Feature: Reduce stock ONLY when order is confirmed
    const { status, force } = req.body;

    if (status === 'confirmed' && order.status !== 'confirmed') {
      // Iterate through items and reduce stock
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (product) {
          const hasEnough = product.stock >= item.quantity;

          if (hasEnough || force) {
            // If forcing, we don't go below 0 because of model validation
            const newStock = Math.max(0, product.stock - item.quantity);
            product.stock = newStock;
            await product.save({ transaction: t });
          } else {
            await t.rollback();
            return res.status(400).json({
              message: `Cannot confirm: Insufficient stock for ${product.name}`,
              code: 'INSUFFICIENT_STOCK',
              productId: product.id,
              currentStock: product.stock,
              required: item.quantity
            });
          }
        }
      }
    }

    // Feature: Restore stock if order is cancelled (optional, but good practice)
    if (status === 'cancelled' && order.status === 'confirmed') {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction: t });
        }
      }
    }

    order.status = status;
    await order.save({ transaction: t });
    await t.commit();

    res.json(order);
  } catch (err) {
    await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

export const cancelOrderItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId, itemId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [OrderItem],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found" });
    }

    const item = await OrderItem.findByPk(itemId, { transaction: t });
    if (!item || item.orderId !== parseInt(orderId)) {
      await t.rollback();
      return res.status(404).json({ message: "Item not found in this order" });
    }

    if (item.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ message: "Item is already cancelled" });
    }

    // 1. Mark item as cancelled
    item.status = 'cancelled';
    await item.save({ transaction: t });

    // 2. Restore stock if the order was already confirmed/processing/shipped/delivered
    // Actually typically confirmed and beyond implies stock was reduced.
    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)) {
      const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
      if (product) {
        product.stock += item.quantity;
        await product.save({ transaction: t });
      }
    }

    // 3. Recalculate totals
    const activeItems = await OrderItem.findAll({
      where: { orderId, status: 'active' },
      transaction: t
    });

    const newSubtotal = activeItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // Adjust total considering coupon
    // Keep the same discount or proportional? Usually keep fixed discount unless it exceeds subtotal
    const newTotal = Math.max(0, newSubtotal - (order.couponDiscount || 0));

    order.subtotal = newSubtotal;
    order.total = newTotal;

    // If NO active items left, we could auto-cancel the order, but let's let the admin decide.
    await order.save({ transaction: t });

    await t.commit();

    // Return updated order
    const updatedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: {
            model: Product,
            attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
          }
        }
      ]
    });

    res.json({ success: true, order: updatedOrder });
  } catch (err) {
    if (t) await t.rollback();
    res.status(500).json({ error: err.message });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    // if (!['admin', 'manager'].includes(req.user.role)) return res.status(403).json({ message: "Admin/Manager only" });

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Not found" });

    const { status } = req.body;
    order.paymentStatus = status;
    await order.save(); // Sequelize ENUM validation will handle invalid values

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    // if (req.user.role !== "admin") return res.status(403).json({ message: "Admin only" });

    const { range = 'year' } = req.query;
    let query;

    if (range === '7days' || range === '30days') {
      const days = range === '7days' ? 7 : 30;
      query = `
        SELECT 
          to_char(date_trunc('day', "createdAt"), 'Mon DD') as date,
          SUM(total) as sales,
          COUNT(id) as orders
        FROM orders
        WHERE "createdAt" >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY date_trunc('day', "createdAt")
        ORDER BY date_trunc('day', "createdAt") ASC
      `;
    } else {
      // Default to Year (Monthly view)
      query = `
        SELECT 
          to_char(date_trunc('month', "createdAt"), 'Mon') as month,
          SUM(total) as sales,
          COUNT(id) as orders
        FROM orders
        WHERE "createdAt" >= date_trunc('year', CURRENT_DATE) 
        GROUP BY date_trunc('month', "createdAt")
        ORDER BY date_trunc('month', "createdAt") ASC
      `;
    }

    const stats = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    console.log(`[getMonthlyStats] Range: ${range}, Stats count: ${stats.length}`);
    if (stats.length === 0) console.log("[getMonthlyStats] Stats are empty!");

    res.json(stats);
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: err.message });
  }
};
