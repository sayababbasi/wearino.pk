import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

// Helper to get or create guest cart ID from session
const getGuestCartId = (req) => {
  if (!req.session) req.session = {};
  if (!req.session.guestCartId) {
    req.session.guestCartId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  return req.session.guestCartId;
};

export const getCart = async (req, res) => {
  try {
    // If user is logged in, use their cart
    if (req.user) {
      let cart = await Cart.findOne({
        where: { userId: req.user.id },
        include: { model: CartItem, include: Product },
      });

      if (!cart) {
        cart = await Cart.create({ userId: req.user.id });
      }

      return res.json({ success: true, cart, isGuest: false });
    }

    // Guest user - return cart from session/localStorage (handled on frontend)
    // Backend doesn't store guest carts, frontend uses localStorage
    res.json({
      success: true,
      cart: { CartItems: [] },
      isGuest: true,
      message: "Guest cart stored locally"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, selectedSize, selectedColor } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Check stock availability
    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // If user is logged in, use database cart
    if (req.user) {
      let cart = await Cart.findOne({ where: { userId: req.user.id } });
      if (!cart) cart = await Cart.create({ userId: req.user.id });

      // check if item exists (matching product AND variant attributes)
      let item = await CartItem.findOne({
        where: {
          cartId: cart.id,
          productId,
          selectedSize: selectedSize || null,
          selectedColor: selectedColor || null
        },
      });

      if (item) {
        const newQuantity = item.quantity + Number(quantity);
        if (product.stock < newQuantity) {
          return res.status(400).json({
            message: `Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`
          });
        }
        item.quantity = newQuantity;
        await item.save();
      } else {
        item = await CartItem.create({
          cartId: cart.id,
          productId,
          quantity,
          priceAtAdd: product.price,
          selectedSize: selectedSize || null,
          selectedColor: selectedColor || null,
        });
      }

      const updated = await Cart.findByPk(cart.id, {
        include: { model: CartItem, include: Product }
      });
      return res.json({ success: true, cart: updated, isGuest: false });
    }

    // Guest user - return product info for frontend to store in localStorage
    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      quantity,
      isGuest: true,
      message: "Item added to guest cart (stored locally)"
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Please login to update cart items"
      });
    }

    const item = await CartItem.findByPk(cartItemId, { include: [Cart, Product] });
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.Cart.userId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Check stock availability
    if (item.Product.stock < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${item.Product.stock}`
      });
    }

    item.quantity = Number(quantity);
    await item.save();

    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.params;

    if (!req.user) {
      return res.status(401).json({
        message: "Please login to remove cart items"
      });
    }

    const item = await CartItem.findByPk(cartItemId, { include: Cart });
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.Cart.userId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await item.destroy();
    res.json({ success: true, message: "Removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.json({
        success: true,
        message: "Guest cart cleared (stored locally)"
      });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.json({ success: true, message: "Cart already empty" });

    await CartItem.destroy({ where: { cartId: cart.id } });
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
