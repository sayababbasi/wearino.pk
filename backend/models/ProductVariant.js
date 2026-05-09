/**
 * Product Variant Model
 * 
 * Manages size/color variants for products with individual SKUs, stock, and pricing.
 * Allows one product to have multiple purchasable options (e.g., S, M, L, XL sizes).
 * 
 * Database Table: "product_variants"
 */

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";
import Product from "./Product.js";

const ProductVariant = sequelize.define("ProductVariant", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    /**
     * Product ID (Foreign Key)
     * Links variant to parent product
     */
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "products",
            key: "id"
        },
        onDelete: "CASCADE",
    },

    /**
     * Size
     * The variant size (e.g., "S", "M", "L", "XL", "One Size")
     */
    size: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    /**
     * Color (optional)
     * If product has color variants
     */
    color: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    /**
     * Variant SKU
     * Unique identifier for this specific variant
     * e.g., "SHIRT-BLK-M" for Black Medium shirt
     */
    sku: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
    },

    /**
     * Variant Stock
     * Individual inventory count for this variant
     */
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        }
    },

    /**
     * Price Adjustment
     * Additional cost for this variant (+ or -)
     * NULL or 0 means same price as base product
     * Example: XL might be +$2.00
     */
    priceAdjustment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
    },

    /**
     * Active Status
     * Enable/disable variant without deleting
     */
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

}, {
    tableName: "product_variants",
    timestamps: true,
    indexes: [
        {
            fields: ['productId']
        },
        {
            unique: true,
            fields: ['sku']
        }
    ]
});

/**
 * Associations
 */
ProductVariant.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(ProductVariant, { foreignKey: "productId", as: "variants" });

export default ProductVariant;
