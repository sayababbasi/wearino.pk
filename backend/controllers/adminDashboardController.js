import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Inquiry from "../models/Inquiry.js";
import Wishlist from "../models/Wishlist.js";

import { Sequelize } from "sequelize";

// ----------- COUNT METRICS -----------
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalCategories = await Category.count();
    const totalInquiries = await Inquiry.count();
    const wishlistCount = await Wishlist.count();



    res.json({
      totalUsers,
      totalProducts,
      totalCategories,
      totalInquiries,
      wishlistCount,

    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------- MONTHLY USERS CHART -----------
export const getMonthlyUserStats = async (req, res) => {
  try {
    const data = await User.findAll({
      attributes: [
        [Sequelize.fn("date_trunc", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: "month",
      order: [["month", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------- MONTHLY PRODUCTS CHART -----------
export const getMonthlyProductStats = async (req, res) => {
  try {
    const data = await Product.findAll({
      attributes: [
        [Sequelize.fn("date_trunc", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: "month",
      order: [["month", "ASC"]],
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------- LATEST USERS -----------
export const getLatestUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "email", "createdAt"],
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------- LATEST INQUIRIES -----------
export const getLatestInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, attributes: ["id", "name", "email"] },
        { model: Product, attributes: ["id", "name", "price"] },
      ],
    });

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------- LOW STOCK PRODUCTS -----------
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { stock: { [Sequelize.Op.lte]: 5 } },
      order: [["stock", "ASC"]],
      attributes: ["id", "name", "stock"],
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ----------- MOST WISHLISTED PRODUCTS -----------
export const getMostWishlisted = async (req, res) => {
  try {
    const data = await Wishlist.findAll({
      attributes: [
        "productId",
        [Sequelize.fn("COUNT", Sequelize.col("productId")), "wishlistCount"],
      ],
      include: [
        {
          model: Product,
          attributes: ["id", "name", "price"]
        }
      ],
      group: ["Wishlist.productId", "Product.id"],
      order: [[Sequelize.literal("wishlistCount"), "DESC"]],
      limit: 5,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
