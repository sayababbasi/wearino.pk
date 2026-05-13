import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import Order from "./Order.js";
import Product from "./Product.js";

const ReturnRequest = sequelize.define("ReturnRequest", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    status: {
        type: DataTypes.STRING, // 'pending', 'approved', 'rejected', 'completed'
        defaultValue: 'pending',
    },
    refundStatus: {
        type: DataTypes.STRING, // 'pending', 'processed', 'not_applicable'
        defaultValue: 'pending',
    },
    adminNote: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: "return_requests",
    timestamps: true,
});

// Associations
ReturnRequest.belongsTo(User, { foreignKey: "userId", as: "user" });
ReturnRequest.belongsTo(Order, { foreignKey: "orderId", as: "order" });
ReturnRequest.belongsTo(Product, { foreignKey: "productId", as: "product" });

User.hasMany(ReturnRequest, { foreignKey: "userId" });
Order.hasMany(ReturnRequest, { foreignKey: "orderId" });
Product.hasMany(ReturnRequest, { foreignKey: "productId" });

export default ReturnRequest;
