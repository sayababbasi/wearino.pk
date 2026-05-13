import { sequelize } from "../config/db.js";
import { Op } from "sequelize";
import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import PaymentProof from "../models/PaymentProof.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

import Setting from "../models/Setting.js";
import DeliveryZone from "../models/DeliveryZone.js";
import PaymentMethod from "../models/PaymentMethod.js";
import Notification from "../models/Notification.js";

export const createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      shippingAddress, 
      paymentMethod: paymentMethodType, 
      items, // For guests or direct checkout
      couponCode, 
    } = req.body;

    // 0. Validation: Basic sanity checks
    if (!shippingAddress || (!items && !req.user)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Shipping address and items are required." });
    }

    // 1. Fetch System Configs
    const [globalTaxSetting, deliveryZones, paymentMethods] = await Promise.all([
      Setting.findOne({ where: { key: 'global_tax_percent' } }),
      DeliveryZone.findAll({ where: { isActive: true } }),
      PaymentMethod.findAll({ where: { isActive: true } })
    ]);

    const globalTaxPercent = globalTaxSetting ? parseFloat(globalTaxSetting.value) : 0;
    const selectedMethod = paymentMethods.find(m => m.type === paymentMethodType);
    
    // Find delivery zone
    const city = (shippingAddress.city || '').trim().toLowerCase();
    const state = (shippingAddress.state || '').trim().toLowerCase();
    const selectedZone = deliveryZones.find(z => 
      z.name.toLowerCase() === city || z.name.toLowerCase() === state
    ) || deliveryZones.find(z => z.name.toLowerCase() === 'default' || z.name.toLowerCase() === 'other');

    // 2. Resolve Items & Security Validation (Price/Stock)
    let inputItems = [];
    if (req.user) {
      const cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: [{ model: CartItem, include: [Product] }],
        transaction: t
      });
      inputItems = (cart && cart.CartItems?.length > 0) ? cart.CartItems : (items || []);
    } else {
      inputItems = items || [];
    }

    if (!inputItems || inputItems.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "No items found to create order." });
    }

    let orderItemsData = [];
    let subtotal = 0;

    for (const item of inputItems) {
      const productId = item.productId || item.Product?.id;
      const dbProduct = await Product.findByPk(productId, { transaction: t });
      
      if (!dbProduct) {
        await t.rollback();
        return res.status(404).json({ success: false, message: `Product not found: ${productId}` });
      }

      // Stock Validation
      if (dbProduct.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ success: false, message: `Insufficient stock for ${dbProduct.name}.` });
      }

      const qty = parseInt(item.quantity);
      const price = parseFloat(dbProduct.price);
      subtotal += price * qty;

      orderItemsData.push({
        productId: dbProduct.id,
        quantity: qty,
        price: price,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        name: dbProduct.name // for notification/wa
      });
    }

    // 3. Coupon Validation (Move before tax/shipping for correct calculation)
    let discount = 0;
    let validatedCouponCode = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        where: { code: couponCode.toUpperCase(), isActive: true },
        transaction: t
      });

      if (coupon) {
        const now = new Date();
        const valid = (!coupon.expiryDate || new Date(coupon.expiryDate) > now) &&
                      (!coupon.minPurchase || subtotal >= parseFloat(coupon.minPurchase));

        if (valid) {
          validatedCouponCode = coupon.code;
          if (coupon.discountType === 'percentage') {
            discount = (subtotal * parseFloat(coupon.discountValue)) / 100;
            if (coupon.maxDiscount && discount > parseFloat(coupon.maxDiscount)) discount = parseFloat(coupon.maxDiscount);
          } else {
            discount = parseFloat(coupon.discountValue);
          }
        }
      }
    }

    // 4. Advanced Financial Calculations
    let shippingFee = selectedZone ? parseFloat(selectedZone.charge) : 200;
    
    // Free Delivery Threshold Support
    if (selectedZone?.freeDeliveryThreshold && subtotal >= parseFloat(selectedZone.freeDeliveryThreshold)) {
      shippingFee = 0;
    }

    // Apply discount BEFORE tax as per user request
    const taxableAmount = Math.max(0, subtotal - discount);
    const totalTax = (taxableAmount * globalTaxPercent) / 100;

    // TOTAL = (subtotal - discount) + delivery + tax
    const finalTotal = Math.max(0, taxableAmount + shippingFee + totalTax);

    // 5. Status Flow Integration
    // COD -> confirmed, others -> pending_payment
    const initialStatus = paymentMethodType === 'cod' ? "confirmed" : "pending_payment";
    
    const orderCount = await Order.count({ transaction: t });
    const formattedOrderNumber = `W-${String(1001 + orderCount).padStart(5, '0')}`;

    // 6. Save Order
    const order = await Order.create({
      userId: req.user?.id || null,
      orderNumber: formattedOrderNumber,
      status: initialStatus,
      subtotal: parseFloat(subtotal.toFixed(2)),
      deliveryCharges: parseFloat(shippingFee.toFixed(2)),
      taxAmount: parseFloat(totalTax.toFixed(2)),
      taxPercentage: parseFloat(globalTaxPercent.toFixed(2)),
      couponCode: validatedCouponCode,
      couponDiscount: parseFloat(discount.toFixed(2)),
      total: parseFloat(finalTotal.toFixed(2)),
      shippingAddress,
      paymentMethod: paymentMethodType,
      paymentStatus: "pending",
      statusHistory: [{
        status: initialStatus,
        message: `Order initialized via ${paymentMethodType.toUpperCase()}.`,
        timestamp: new Date()
      }]
    }, { transaction: t });

    // 7. Save Items
    await OrderItem.bulkCreate(orderItemsData.map(item => ({
      ...item,
      orderId: order.id
    })), { transaction: t });

    // 8. Inventory Management (Deduct stock for COD immediately)
    if (paymentMethodType === 'cod') {
      for (const item of orderItemsData) {
        await Product.decrement('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
      }
    }

    // 9. Cleanup (Cart)
    if (req.user) {
      const cart = await Cart.findOne({ where: { userId: req.user.id } });
      if (cart) await CartItem.destroy({ where: { cartId: cart.id }, transaction: t });
    }

    await t.commit();

    // 10. Post-creation Services (Notifications/Links)
    const productNames = orderItemsData.map(i => i.name).join(", ");
    const waText = `*New Order: ${formattedOrderNumber}*\n*Items:* ${productNames}\n*Total:* Rs ${finalTotal}\n*Method:* ${paymentMethodType.toUpperCase()}\n\nPlease verify.`;
    const waLink = `https://wa.me/923160513841?text=${encodeURIComponent(waText)}`;

    Notification.create({
      type: 'new_order',
      title: 'New Order',
      message: `Order ${formattedOrderNumber} received. Total: Rs ${finalTotal}`,
      link: `/admin/orders/${order.id}`
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
      whatsappLink: waLink
    });

  } catch (err) {
    if (t) await t.rollback();
    console.error("[createOrder] Failure:", err);
    res.status(500).json({ success: false, message: "Failed to create order.", error: err.message });
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
        },
        { model: PaymentProof }
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

    return res.json({ success: true, data: { orders } });
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
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
          },
          { model: PaymentProof }
        ]
      });
    }

    // Fallback: search by order number if not found by PK
    if (!order) {
      console.log(`[getOrderById] Searching for ID: ${id}`);
      const cleanId = id.replace('#', '');
      const numericPart = id.replace(/[^0-9]/g, '');
      
      const searchConditions = [
        { orderNumber: id },
        { orderNumber: `#${id}` },
        { orderNumber: cleanId },
        { orderNumber: `#${cleanId}` }
      ];

      // Add fuzzy numeric matching if possible
      if (numericPart && numericPart.length > 0) {
        searchConditions.push({ orderNumber: { [Op.like]: `%${numericPart}` } });
      }

      console.log(`[getOrderById] Search conditions count: ${searchConditions.length}`);

      order = await Order.findOne({
        where: { [Op.or]: searchConditions },
        include: [
          { model: User, attributes: ['id', 'name', 'email'] },
          {
            model: OrderItem,
            include: {
              model: Product,
              attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
            }
          },
          { model: PaymentProof }
        ],
        order: [['createdAt', 'DESC']] // Get newest if multiple match
      });
    }

    if (!order) {
      console.error(`[getOrderById] Order NOT FOUND for ID: ${id}`);
      return res.status(404).json({ message: "Not found" });
    }

    // Access Control
    // 1. Admin: Allow full access
    if (req.user && req.user.role === 'admin') {
      return res.json({ success: true, data: { order } });
    }

    // 2. Owner (Logged in): Allow if userId matches
    if (req.user && order.userId === req.user.id) {
      return res.json({ success: true, data: { order } });
    }

    // 3. Guest/Public: Allow if accessed via orderNumber (acting as secret key)
    // We allow fuzzy matching here too to match our lookup logic
    const cleanOrderNumber = order.orderNumber.replace('#', '');
    const cleanRequestId = id.replace('#', '');
    
    // Also try numeric normalization (e.g. 0009 -> 9)
    const normOrder = order.orderNumber.replace(/[^0-9]/g, '').replace(/^0+/, '');
    const normRequest = id.replace(/[^0-9]/g, '').replace(/^0+/, '');
    
    if (order.orderNumber === id || 
        cleanOrderNumber === cleanRequestId || 
        (normOrder === normRequest && normOrder.length > 0)) {
       return res.json({ success: true, data: { order } });
    }

    // If we reach here, it's either a numeric ID guess or a mismatch
    console.warn(`[getOrderById] Access denied for ID: ${id}. Order found was: ${order.orderNumber}`);
    return res.status(404).json({ success: false, message: "Order not found or access denied" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching order", error: err.message });
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
    const { status, message } = req.body;
    
    // Validate order status
    const validStatuses = ["pending_payment", "under_review", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    if (status === 'confirmed' && order.status !== 'confirmed') {
      // Iterate through items and reduce stock
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (product) {
          const hasEnough = product.stock >= item.quantity;

          if (hasEnough) {
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save({ transaction: t });
          } else {
            await t.rollback();
            return res.status(400).json({
              success: false,
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

    // Restore stock if order is cancelled from a confirmed state
    if (status === 'cancelled' && (order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped')) {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId, { transaction: t, lock: t.LOCK.UPDATE });
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction: t });
        }
      }
    }

    order.status = status;
    
    // Append to history
    const history = order.statusHistory || [];
    history.push({
      status,
      message: message || `Order status updated to ${status.replace('_', ' ').toUpperCase()}`,
      timestamp: new Date(),
      updatedBy: req.user?.name || 'Admin'
    });
    order.statusHistory = history;
    order.changed('statusHistory', true);

    await order.save({ transaction: t });
    await t.commit();

    res.json({ success: true, message: `Status updated to ${status}`, data: { order } });
  } catch (err) {
    if (t) await t.rollback();
    res.status(500).json({ success: false, message: "Failed to update status", error: err.message });
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

    res.json({ success: true, data: { order: updatedOrder } });
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
    
    // User requested: pending -> verified -> rejected
    const validPaymentStatuses = ["pending", "verified", "paid", "failed", "refunded", "rejected"];
    if (!validPaymentStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid payment status" });
    }

    order.paymentStatus = status;
    
    // Automatically confirm order if payment is verified
    if (status === 'verified' && order.status === 'pending') {
      order.status = 'confirmed';
    }

    await order.save();
    res.json({ success: true, data: { order } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update payment status", error: err.message });
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
          to_char(date_trunc('day', "created_at"), 'Mon DD') as date,
          SUM(total_amount) as sales,
          COUNT(id) as orders
        FROM orders
        WHERE "created_at" >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY date_trunc('day', "created_at")
        ORDER BY date_trunc('day', "created_at") ASC
      `;
    } else {
      // Default to Year (Monthly view)
      query = `
        SELECT 
          to_char(date_trunc('month', "created_at"), 'Mon') as month,
          SUM(total_amount) as sales,
          COUNT(id) as orders
        FROM orders
        WHERE "created_at" >= date_trunc('year', CURRENT_DATE) 
        GROUP BY date_trunc('month', "created_at")
        ORDER BY date_trunc('month', "created_at") ASC
      `;
    }

    const stats = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    console.log(`[getMonthlyStats] Range: ${range}, Stats count: ${stats.length}`);
    
    res.json({ success: true, data: { stats } });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch stats", error: err.message });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cleanNumeric = id.replace(/^#?\s*W?-?\s*/i, '');
    const variations = [
      id,
      `#${id}`,
      `#W-${cleanNumeric}`,
      cleanNumeric,
      `%${cleanNumeric}` // Ends with numeric part
    ];

    const order = await Order.findOne({
      where: {
        [Op.or]: variations.map(v => ({
          orderNumber: { [Op.iLike]: v }
        }))
      },
      include: [
        {
          model: OrderItem,
          include: {
            model: Product,
            attributes: ['id', 'name', 'images', 'price', 'sku']
          }
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found. Please check your Order ID." 
      });
    }

    const maskedOrder = {
      orderNumber: order.orderNumber,
      status: order.status,
      statusHistory: order.statusHistory || [],
      createdAt: order.createdAt,
      total: order.total,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      items: order.OrderItems.map(item => ({
        name: item.Product?.name,
        image: item.Product?.images?.[0] || item.Product?.image,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize,
        color: item.selectedColor
      })),
      customerName: typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress).name.replace(/^(.).+(.)$/, "$1***$2") 
        : (order.shippingAddress?.name || "Customer").replace(/^(.).+(.)$/, "$1***$2"),
      estimatedDelivery: "3-5 Business Days"
    };

    res.json({ success: true, data: { order: maskedOrder } });
  } catch (err) {
    console.error("trackOrder error:", err);
    res.status(500).json({ success: false, message: "Failed to track order", error: err.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please upload a screenshot" });
    }

    // Save screenshot path - handle Cloudinary URL if present
    const screenshotUrl = req.file.path || `/uploads/${req.file.filename}`;
    order.paymentProofImage = screenshotUrl;
    order.paymentStatus = 'pending'; // Reset to pending for review
    
    // Append to history
    const history = order.statusHistory || [];
    history.push({
      status: order.status,
      message: `Payment proof uploaded via website. Transaction ID: ${req.body.transactionId || 'Not provided'}`,
      timestamp: new Date()
    });
    order.statusHistory = history;

    if (req.body.transactionId) {
      order.paymentInfo = {
        ...order.paymentInfo,
        transactionId: req.body.transactionId
      };
    }

    await order.save();

    // Notify Admin
    try {
      await Notification.create({
        type: 'payment_received',
        title: 'Payment Proof Uploaded',
        message: `Payment proof uploaded for Order ${order.orderNumber}. Please verify.`,
        link: `/admin/orders/${order.id}`
      });
    } catch (nErr) {
      console.error("Failed to create notification:", nErr);
    }

    res.json({ success: true, message: "Proof uploaded successfully", data: { order } });
  } catch (err) {
    console.error("uploadPaymentProof error:", err);
    res.status(500).json({ success: false, message: "Failed to upload proof", error: err.message });
  }
};
