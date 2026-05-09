/**
 * Coupon Model
 * 
 * Manages discount codes that customers can apply at checkout.
 * Supports both percentage and fixed amount discounts with various restrictions.
 * 
 * Database Table: "coupons"
 */

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const Coupon = sequelize.define("Coupon", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    /**
     * Coupon Code
     * Unique code string that customers enter (e.g., "SAVE20", "SUMMER2024")
     * Case-insensitive for validation
     */
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isUppercase: true, // Enforce uppercase storage
        }
    },

    /**
     * Discount Type
     * "percentage" - discount as % of order total (e.g., 20 for 20%)
     * "fixed" - flat dollar amount off (e.g., 10 for $10 off)
     */
    discountType: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
    },

    /**
     * Discount Value
     * The numerical value of the discount
     * For percentage: 1-100 (representing percentage)
     * For fixed: any positive number (dollar amount)
     */
    discountValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0,
        }
    },

    /**
     * Minimum Purchase Amount
     * Order must meet this subtotal to apply coupon
     * NULL means no minimum
     */
    minPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
    },

    /**
     * Maximum Discount Cap
     * For percentage coupons, cap the max discount amount
     * e.g., 20% off with $50 max = saves max $50 even on $1000 order
     */
    maxDiscount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: null,
    },

    /**
     * Start Date
     * Coupon becomes valid from this date/time
     * NULL means valid immediately
     */
    startDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },

    /**
     * Expiry Date
     * Coupon expires after this date/time
     * NULL means never expires
     */
    expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },

    /**
     * Usage Limit
     * Total number of times this coupon can be used across all customers
     * NULL means unlimited uses
     */
    usageLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
    },

    /**
     * Usage Count
     * Current number of times this coupon has been used
     * Incremented on successful order
     */
    usageCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },

    /**
     * Active Status
     * Admin can enable/disable coupons without deleting them
     */
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    /**
     * Applicable Products
     * JSON array of product IDs this coupon applies to
     * NULL or empty array = applies to all products
     */
    applicableProducts: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
    },

    /**
     * Description
     * Internal note for admin (not shown to customers)
     */
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

}, {
    tableName: "coupons",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['code']
        }
    ]
});

export default Coupon;
