import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import OrderItem from "./OrderItem.js";
import Product from "./Product.js";

const Order = sequelize.define("Order", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Allow guest orders
    references: {
      model: "users",
      key: "id",
    },
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Optional for backward compatibility, but valid for new orders
    unique: true
  },
  status: {
    type: DataTypes.ENUM("pending", "paid", "confirmed", "processing", "shipped", "delivered", "cancelled"),
    defaultValue: "pending",
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.JSON, // Use JSON for address details
    allowNull: false,
  },
  paymentInfo: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
    defaultValue: "pending",
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  couponDiscount: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: "orders",
  timestamps: true,
});

// Associations
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

export default Order;
