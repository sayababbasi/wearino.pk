/**
 * Product Model
 * 
 * Defines the database schema and relationships for products in the e-commerce system.
 * Products represent items that can be purchased, displayed, and managed through the admin dashboard.
 * 
 * Database Table: "products"
 * 
 * Relationships:
 * - Belongs to Category (many products can belong to one category)
 * - Has many CartItems (one product can be in multiple carts)
 * - Has many OrderItems (one product can be in multiple orders)
 * 
 * @module models/Product
 */

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";
import Category from "./Category.js";

/**
 * Product Model Definition
 * 
 * Represents a product in the e-commerce catalog with all its attributes,
 * pricing, inventory, and categorization information.
 */
const Product = sequelize.define("Product", {
  /**
   * Product ID
   * Primary key, auto-incremented integer
   * Used to uniquely identify each product in the system
   */
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  /**
   * Product Name
   * Required, unique string field
   * The display name of the product (e.g., "Classic White Tee")
   * Must be unique across all products to prevent duplicates
   */
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },

  /**
   * Product Description
   * Optional text field for detailed product information
   * Can contain HTML or markdown for rich text descriptions
   * Used in product detail pages and search results
   */
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  /**
   * Product Price
   * Required float field representing the base price
   * Stored as decimal number (e.g., 29.99)
   * Used for calculations in cart, checkout, and order totals
   * Note: Discounts are calculated separately, not stored here
   */
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  /**
   * Stock Keeping Unit (SKU)
   * Unique identifier for inventory management
   */
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },

  /**
   * Product Status
   * Controls visibility: 'active', 'draft', 'archived'
   */
  status: {
    type: DataTypes.STRING, // 'active', 'draft', 'archived'
    defaultValue: 'active',
  },

  /**
   * Product Images
   * JSON array field storing multiple image URLs
   * Can be local paths or external URLs
   * Replaces the old single 'image' string field
   */
  images: {
    type: DataTypes.JSON,
    defaultValue: [],
  },

  /**
   * Category ID (Foreign Key)
   * Links product to its category in the categories table
   * Optional - products can exist without a category
   * Used for filtering and navigation (e.g., "Tops", "Dresses")
   * 
   * Note: Current schema doesn't support department/subcategory hierarchy.
   * Products link directly to categories, not departments.
   */
  categoryId: {
    type: DataTypes.INTEGER,
    references: { model: "categories", key: "id" },
  },

  /**
   * View Count
   * Integer tracking how many times the product has been viewed
   * Defaults to 0, incremented each time product detail page is accessed
   * Used for analytics and trending product calculations
   */
  view: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  /**
   * Stock Quantity
   * Required integer representing available inventory
   * Defaults to 0 if not specified
   * Decremented automatically when orders are created
   * Used to prevent overselling and show "Out of Stock" status
   */
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0,
    }
  },

  /**
   * Product Tags
   * JSON array field for flexible categorization and filtering
   * Examples: ["Sale", "New", "Trending", "Featured"]
   * Used for homepage sections (Flash Sales, New Arrivals, Trending)
   * Allows multiple tags per product for cross-category promotion
   * 
   * Tag values are case-sensitive in backend but filtered case-insensitively
   */
  tags: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  /**
   * Has Variants
   * Indicates if this product has size/color variants
   * If true, stock is managed at variant level
   */
  hasVariants: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  /**
   * Trending Status
   * Manual override flag for the "Trending" category logic.
   * If true, this product appears at the top of the trending list (Priority A).
   */
  isTrending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  /**
   * Discount Percentage
   * Represents the discount applied to the base price as a percentage
   * Defaults to 0 (no discount)
   * Used for calculating and displaying promotional prices in the storefront
   */
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },

  /**
   * Available Sizes
   * JSON array field storing size options for this product
   * Examples: ["XS", "S", "M", "L", "XL"], ["One Size"], []
   * Empty array means no size selection needed
   */
  sizes: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
}, {
  tableName: "products",
  timestamps: true,
  indexes: [
    {
      fields: ['categoryId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['isTrending']
    }
  ]
});

/**
 * Model Associations
 */

/**
 * Product belongs to Category (Primary Category)
 */
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

/**
 * Product belongs to many Categories (Secondary/Additional Categories)
 * Enables "Global Product Placement" - one product in multiple categories.
 */
Product.belongsToMany(Category, {
  through: "ProductCategories",
  as: "secondaryCategories", // distinctive alias
  foreignKey: "productId",
  otherKey: "categoryId"
});

/**
 * Category has many Products
 * Establishes one-to-many relationship: one category can have many products
 * 
 * @param {Object} Product - The Product model
 * @param {Object} options - Association options
 * @param {string} options.foreignKey - "categoryId" - the foreign key in products table
 * @param {string} options.as - "products" - alias for accessing products from category
 * 
 * Usage:
 *   const category = await Category.findByPk(1, { include: [{ model: Product, as: "products" }] });
 *   console.log(category.products.length); // number of products in this category
 */
/**
 * Category has many Products (Primary Link)
 */
Category.hasMany(Product, { foreignKey: "categoryId", as: "products" });

/**
 * Category belongs to many Products (Secondary Link)
 */
Category.belongsToMany(Product, {
  through: "ProductCategories",
  as: "secondaryProducts",
  foreignKey: "categoryId",
  otherKey: "productId"
});

export default Product;
