import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const OrderItem = sequelize.define("OrderItem", {
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }, // snapshot price
  selectedSize: { type: DataTypes.STRING, allowNull: true }, // Size variant (XS, S, M, L, XL etc.)
  selectedColor: { type: DataTypes.STRING, allowNull: true }, // Color variant
  status: {
    type: DataTypes.STRING, // "active", "cancelled"
    defaultValue: "active",
  },
}, {
  tableName: "order_items",
  timestamps: true,
});

export default OrderItem;
