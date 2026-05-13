/**
 * Category Model
 * 
 * Defines the database schema for product categories in the e-commerce system.
 * Categories are used to organize and filter products (e.g., "Tops", "Dresses", "Jackets").
 * 
 * Database Table: "categories"
 * 
 * Relationships:
 * - Has many Products (one category can have many products)
 * 
 * Note: Current schema uses a flat category structure. Categories can represent either:
 * - Subcategories: "Tops", "Dresses", "Jackets", "Bottoms", "Accessories"
 * - Departments: "Women", "Men", "Kids", "Beauty"
 * 
 * There is no explicit department/subcategory hierarchy in the database.
 * Products link directly to categories via categoryId.
 * 
 * @module models/Category
 */

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

/**
 * Category Model Definition
 * 
 * Represents a category that groups related products together.
 * Categories are used for navigation, filtering, and organizing the product catalog.
 */
const Category = sequelize.define("Category", {
    /**
     * Category ID
     * Primary key, auto-incremented integer
     * Used to uniquely identify each category in the system
     * Referenced by products via categoryId foreign key
     */
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    /**
     * Category Name
     * Required, unique string field
     * The display name of the category (e.g., "Tops", "Dresses", "Women")
     * Must be unique to prevent duplicate categories
     * 
     * Examples:
     * - Subcategories: "Tops", "Bottoms", "Dresses", "Jackets", "Accessories"
     * - Departments: "Women", "Men", "Kids", "Beauty"
     * 
     * Note: The current implementation doesn't distinguish between
     * departments and subcategories. Both are stored as category names.
     */
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING, // 'active', 'inactive'
        defaultValue: 'active',
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "categories",
            key: "id",
        },
        onDelete: "SET NULL",
    },
},

    {
        /**
         * Table Configuration
         * Explicitly sets the database table name to "categories"
         * Enables automatic timestamp tracking (createdAt, updatedAt)
         */
        tableName: "categories",
        timestamps: true,
    });


// Define relationship inside the model file (optional but cleaner if consistent with Product.js)
// Note: Associations are often defined in a central `index.js` or `associations.js` file 
// but here they are defined in model files. 
// However, Product.js imports Category.js so we can't import Product.js here easily due to circular dependency.
// Sequelize handles this by allowing string references or defining associations after all models are initialized.
// Since Product.js defines BOTH sides usually in a simple setup, or we use a separate init.
// But based on Product.js content, it was importing Category. 
// We will skip defining the ASSOCIATION explicitly here to avoid circular dependency issues 
// if Product.js already defined the other side (belongsToMany usually sets up both if defined correctly, 
// but typically you define both).
// Given the current structure, Product.js has `import Category`. 
// If we `import Product` here we get a cycle. 
// So we will leave the association definition PRIMARILY in Product.js or use a separate association setup if needed.
// BUT, wait, the user's codebase DOES NOT have a central association file (checked earlier, empty).
// Product.js has `Category.hasMany(Product)` at the bottom.
// So Product.js controls the associations. I will NOT add it here to avoid circular import.
// Instead I will update Product.js to ensure it has the other side if needed, BUT `Product.js` edits already included `Category.hasMany`? 
// No, I only see `Product.belongsTo`. 
// Let's re-read Product.js. It has `Category.hasMany` at the end.
// So I should add `Category.belongsToMany` at the end of Product.js! 
// NOT Category.js.

export default Category; 