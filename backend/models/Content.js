/**
 * Content Model
 * 
 * Defines the database schema for dynamic homepage content.
 * Manages Banners, Announcements, and Featured Sections.
 * 
 * @module models/Content
 */

import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";
import Product from "./Product.js";

const Content = sequelize.define("Content", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    /**
     * Type of content: 'banner', 'announcement', 'featured_product'
     */
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    /**
     * For banners/featured items: URL to the image
     */
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    /**
     * Where clicking the content leads (e.g., /products/1, /categories/sale)
     */
    linkUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    /**
     * Display position/zone:
     * - Banners: 'hero', 'secondary', 'promotional'
     * - Featured: (unused, or 'homepage')
     * - Announcement: 'top_bar'
     */
    position: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    /**
     * Product ID (Foreign Key)
     * For 'featured_product' type, links to the actual product
     */
    productId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "products", key: "id" },
    },
    /**
     * Sort order for display
     */
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    /**
     * Additional configuration (JSON)
     * - Announcement: { backgroundColor, textColor }
     * - Banner: { subtitle, buttonText }
     */
    meta: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: true,
    },
}, {
    tableName: "contents",
    timestamps: true,
});

// Association: Content belongs to Product (for featured_product type)
Content.belongsTo(Product, { foreignKey: "productId", as: "product" });

export default Content;

