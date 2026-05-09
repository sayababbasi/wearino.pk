import { DataTypes } from "sequelize";
import {sequelize} from "../config/db.js";
import User from "./User.js";
import Product from "./Product.js";
const Inquiry = sequelize.define("Inquiry", {
  userId: { type: DataTypes.INTEGER, allowNull: true }, // guest allowed
  productId: { type: DataTypes.INTEGER, allowNull: true }, // optional - null for general contact inquiries
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: true }, // optional subject for contact form
});

User.hasMany(Inquiry, { foreignKey: "userId", onDelete: "SET NULL" });
Inquiry.belongsTo(User, { foreignKey: "userId" });
Product.hasMany(Inquiry, { foreignKey: "productId", onDelete: "CASCADE" });
Inquiry.belongsTo(Product, { foreignKey: "productId", required: false }); // Optional association    
export default Inquiry;
