/**
 * Cart Model
 * 
 * Defines the database schema for shopping carts in the e-commerce system.
 * Each logged-in user has one cart that persists across sessions.
 * 
 * Database Table: "carts"
 * 
 * Relationships:
 * - Belongs to User (one cart per user, one-to-one relationship)
 * - Has many CartItems (one cart contains many cart items)
 * 
 * Note: Guest users (not logged in) do NOT have database carts.
 * Guest cart data is stored in browser localStorage on the frontend.
 * 
 * @module models/Cart
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import CartItem from "./CartItem.js";
import Product from "./Product.js";

/**
 * Cart Model Definition
 * 
 * Represents a user's shopping cart containing multiple products.
 * Each user has exactly one cart (one-to-one relationship with User).
 * The cart itself doesn't store product data - that's in CartItem.
 */
const Cart = sequelize.define(
  "Cart",
  {
    /**
     * User ID (Foreign Key)
     * Links this cart to its owner (user)
     * Required and unique - ensures one cart per user
     * 
     * References: users.id
     * Relationship: One Cart belongs to one User (one-to-one)
     * 
     * Note: This is the primary way to identify which cart belongs to which user.
     * When a user logs in, their cart is retrieved using userId.
     */
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      unique: true 
    },
  },
  {
    /**
     * Table Configuration
     * Explicitly sets the database table name to "carts"
     * Enables automatic timestamp tracking (createdAt, updatedAt)
     */
    tableName: "carts",
    timestamps: true,
  }
);

/**
 * Model Associations
 * 
 * Defines relationships between Cart and other models for Sequelize ORM.
 * These associations enable eager loading and relationship queries.
 */

/**
 * User has one Cart
 * Establishes one-to-one relationship: each user has exactly one cart
 * 
 * @param {Object} Cart - The Cart model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "userId" - the foreign key in carts table
 * @param {string} options.onDelete - "CASCADE" - if user is deleted, their cart is also deleted
 * 
 * Usage:
 *   const user = await User.findByPk(1, { include: [{ model: Cart }] });
 *   console.log(user.Cart); // The user's cart
 */
User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });

/**
 * Cart belongs to User
 * Establishes one-to-one relationship: each cart belongs to exactly one user
 * 
 * @param {Object} User - The User model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "userId" - the foreign key in carts table
 * 
 * Usage:
 *   const cart = await Cart.findByPk(1, { include: [{ model: User }] });
 *   console.log(cart.User); // The cart's owner
 */
Cart.belongsTo(User, { foreignKey: "userId" });

/**
 * Cart has many CartItems
 * Establishes one-to-many relationship: one cart contains many cart items
 * 
 * @param {Object} CartItem - The CartItem model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "cartId" - the foreign key in CartItems table
 * @param {string} options.onDelete - "CASCADE" - if cart is deleted, all cart items are deleted
 * 
 * Usage:
 *   const cart = await Cart.findByPk(1, { include: [{ model: CartItem, include: [Product] }] });
 *   console.log(cart.CartItems); // Array of items in the cart
 */
Cart.hasMany(CartItem, { foreignKey: "cartId", onDelete: "CASCADE" });

/**
 * CartItem belongs to Cart
 * Establishes many-to-one relationship: many cart items belong to one cart
 * 
 * @param {Object} Cart - The Cart model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "cartId" - the foreign key in CartItems table
 * 
 * Usage:
 *   const cartItem = await CartItem.findByPk(1, { include: [{ model: Cart }] });
 *   console.log(cartItem.Cart); // The cart this item belongs to
 */
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

/**
 * Product has many CartItems
 * Establishes one-to-many relationship: one product can be in many carts
 * 
 * @param {Object} CartItem - The CartItem model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "productId" - the foreign key in CartItems table
 * @param {string} options.onDelete - "CASCADE" - if product is deleted, all cart items referencing it are deleted
 * 
 * Usage:
 *   const product = await Product.findByPk(1, { include: [{ model: CartItem }] });
 *   console.log(product.CartItems); // Array of cart items containing this product
 */
Product.hasMany(CartItem, { foreignKey: "productId", onDelete: "CASCADE" });

/**
 * CartItem belongs to Product
 * Establishes many-to-one relationship: many cart items can reference the same product
 * 
 * @param {Object} Product - The Product model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "productId" - the foreign key in CartItems table
 * 
 * Usage:
 *   const cartItem = await CartItem.findByPk(1, { include: [{ model: Product }] });
 *   console.log(cartItem.Product); // The product this cart item references
 */
CartItem.belongsTo(Product, { foreignKey: "productId" });

export default Cart;
