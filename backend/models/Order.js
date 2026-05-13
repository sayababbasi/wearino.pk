import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./User.js";
import OrderItem from "./OrderItem.js";
import Product from "./Product.js";
import PaymentProof from "./PaymentProof.js";

const Order = sequelize.define("Order", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id', // Map to snake_case for DB if preferred, but keep camelCase for JS
    references: {
      model: "users",
      key: "id",
    },
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'order_number'
  },
  status: {
    type: DataTypes.STRING, // "pending_payment", "under_review", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"
    defaultValue: "pending_payment",
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'rejection_reason'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'subtotal'
  },
  deliveryCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
    field: 'delivery_charges'
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
    field: 'tax_amount'
  },
  taxPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    allowNull: true,
    field: 'tax_percentage'
  },
  couponDiscount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: true,
    field: 'coupon_discount'
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_amount'
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING, // cod, bank_transfer, easypaisa, jazzcash
    allowNull: true,
    field: 'payment_method'
  },
  paymentInfo: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  paymentStatus: {
    type: DataTypes.STRING, // "pending", "verified", "paid", "failed", "refunded", "rejected"
    defaultValue: "pending",
    field: 'payment_status'
  },
  paymentProofImage: {
    type: DataTypes.STRING, // URL to screenshot (Cloudinary)
    allowNull: true,
    field: 'payment_proof_image'
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'coupon_code'
  },
  statusHistory: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    field: 'status_history'
  },
}, {
  tableName: "orders",
  timestamps: true,
  underscored: true,
});

// Associations
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Order.hasMany(PaymentProof, { foreignKey: "orderId" });
PaymentProof.belongsTo(Order, { foreignKey: "orderId" });

export default Order;
