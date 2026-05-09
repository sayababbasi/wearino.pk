/**
 * Review Model
 * 
 * Manages customer product reviews with verified purchase tracking.
 * Only customers who purchased a product can leave reviews.
 * 
 * Database Table: "reviews"
 */

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";
import Product from "./Product.js";
import User from "./User.js";
import Order from "./Order.js";

const Review = sequelize.define("Review", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    /**
     * Product ID (Foreign Key)
     * The product being reviewed
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
     * User ID (Foreign Key)
     * The customer who wrote the review
     */
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "users",
            key: "id"
        },
        onDelete: "CASCADE",
    },

    /**
     * Order ID (Foreign Key) - Optional but recommended
     * Links to the order where this product was purchased
     * Used to verify purchase and show "Verified Purchase" badge
     */
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "orders",
            key: "id"
        },
    },

    /**
     * Rating
     * Star rating from 1-5
     */
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5,
        }
    },

    /**
     * Review Text
     * Written review content (optional - can just rate)
     */
    reviewText: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    /**
     * Verified Purchase
     * Auto-set to true if orderId is provided
     * Shows "Verified Purchase" badge on review
     */
    isVerifiedPurchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },

    /**
     * Approved Status
     * For moderation - admin can approve/reject reviews
     * Default true (auto-approve), admin can set false to hide
     */
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },

    /**
     * Helpful Count
     * Number of users who found this review helpful
     */
    helpfulCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },

}, {
    tableName: "reviews",
    timestamps: true,
    indexes: [
        {
            fields: ['productId']
        },
        {
            fields: ['userId']
        },
        {
            unique: true,
            fields: ['productId', 'userId'] // One review per user per product
        }
    ]
});

/**
 * Associations
 */
Review.belongsTo(Product, { foreignKey: "productId", as: "product" });
Review.belongsTo(User, { foreignKey: "userId", as: "user" });
Review.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(Review, { foreignKey: "productId", as: "reviews" });
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });

export default Review;
