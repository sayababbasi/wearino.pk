import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING, // 'new_order', 'payment_received', 'low_stock'
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "notifications",
  timestamps: true,
  underscored: true
});

export default Notification;
