/**
 * CartItem Model
 * 
 * Defines the database schema for items within a shopping cart.
 * CartItem is a junction table that links Cart, Product, and stores item-specific data.
 * 
 * Database Table: "CartItems" (default Sequelize naming)
 * 
 * Relationships:
 * - Belongs to Cart (many cart items belong to one cart)
 * - Belongs to Product (many cart items can reference the same product)
 * 
 * Purpose:
 * - Stores the quantity of each product in a user's cart
 * - Captures the price at the time the item was added (price snapshot)
 * - Allows multiple quantities of the same product in one cart
 * 
 * @module models/CartItem
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * CartItem Model Definition
 * 
 * Represents a single product item within a shopping cart with its quantity and price.
 * This is a junction table that creates a many-to-many relationship between
 * Cart and Product, with additional attributes (quantity, priceAtAdd).
 */
const CartItem = sequelize.define(
  "CartItem",
  {
    /**
     * CartItem ID
     * Primary key, auto-incremented integer
     * Used to uniquely identify each cart item entry
     */
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    /**
     * Cart ID (Foreign Key)
     * Links this cart item to its parent cart
     * Required - every cart item must belong to a cart
     * 
     * References: carts.id
     * Relationship: Many CartItems belong to one Cart
     */
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "carts", // table name (must match Cart.tableName)
        key: "id",
      },
    },

    /**
     * Product ID (Foreign Key)
     * Links this cart item to the product being purchased
     * Required - every cart item must reference a product
     * 
     * References: products.id
     * Relationship: Many CartItems can reference the same Product
     * 
     * Note: The same product can appear multiple times in different carts,
     * or even multiple times in the same cart (as separate CartItem entries).
     */
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
    },

    /**
     * Quantity
     * Required integer representing how many units of this product are in the cart
     * Defaults to 1 if not specified
     * Must be positive (enforced by application logic, not database constraint)
     * 
     * Example: If user adds 3 units of "Classic White Tee", quantity = 3
     * 
     * Used for:
     * - Calculating cart totals (quantity * priceAtAdd)
     * - Stock validation before checkout
     * - Displaying item count in cart UI
     */
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    /**
     * Price at Add (Price Snapshot)
     * Required float storing the product price when item was added to cart
     * 
     * Purpose:
     * - Prevents price changes from affecting items already in cart
     * - Ensures user pays the price they saw when adding to cart
     * - Critical for price integrity during checkout
     * 
     * Example:
     * - Product price: $29.99
     * - User adds to cart: priceAtAdd = $29.99
     * - Product price changes to $39.99
     * - Cart item still shows $29.99 (priceAtAdd)
     * 
     * This is a snapshot value and does NOT update if product price changes.
     */
    priceAtAdd: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    /**
     * Variant ID (Foreign Key) - Optional
     * If product has variants, this links to the specific variant selected
     * NULL for products without variants
     */
    variantId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "product_variants",
        key: "id",
      },
    },

    /**
     * Selected Size - Display Field
     * Stores the size text for display purposes (e.g., "M", "L")
     * Redundant with variant but useful for quick access
     */
    selectedSize: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    /**
     * Table Configuration
     * Enables automatic timestamp tracking (createdAt, updatedAt)
     * Timestamps track when item was added and last modified
     */
    timestamps: true
  }
);

export default CartItem;
