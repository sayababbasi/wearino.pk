import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Inquiry from "../models/Inquiry.js";
import { sequelize } from "../config/db.js";
import { Op } from "sequelize";

// Helper for growth calculation
const calculateGrowth = async (Model, metric = 'count', dateField = 'createdAt') => {
  const now = new Date();
  const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  let currentVal = 0;
  let lastMonthVal = 0;

  if (metric === 'count') {
    currentVal = await Model.count({ where: { [dateField]: { [Op.gte]: firstDayCurrentMonth } } });
    lastMonthVal = await Model.count({ where: { [dateField]: { [Op.gte]: firstDayLastMonth, [Op.lte]: lastDayLastMonth } } });
  } else if (metric === 'sum') {
    // For revenue (total_amount) or views
    const field = dateField === 'views' ? 'view' : 'total_amount';
    const currentSum = await Model.sum(field, { where: { [dateField === 'views' ? 'updatedAt' : 'createdAt']: { [Op.gte]: firstDayCurrentMonth } } });
    const lastMonthSum = await Model.sum(field, { where: { [dateField === 'views' ? 'updatedAt' : 'createdAt']: { [Op.gte]: firstDayLastMonth, [Op.lte]: lastDayLastMonth } } });
    currentVal = parseFloat(currentSum) || 0;
    lastMonthVal = parseFloat(lastMonthSum) || 0;
  }

  if (lastMonthVal === 0) return currentVal > 0 ? 100 : 0;
  return Math.round(((currentVal - lastMonthVal) / lastMonthVal) * 100);
};

// ========== TOP VIEWED PRODUCTS ==========
export const getTopViewedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [["view", "DESC"]],
      limit: 10,
      attributes: ["id", "name", "price", "view", "createdAt", "images"],
    });

    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========== TOTAL COUNTS & GROWTH ==========
export const getCounts = async (req, res) => {
  try {
    const productsCount = await Product.count();
    const inquiriesCount = await Inquiry.count();
    const totalViews = await Product.sum("view") || 0;

    // Total Revenue (All orders) - Using total_amount to avoid 'total' column error
    const totalRevenue = await Order.sum('total_amount') || 0;
    const totalOrders = await Order.count(); // All orders

    // Calculate Growth
    const revenueGrowth = await calculateGrowth(Order, 'sum', 'createdAt');

    // Refine revenue growth to paid only
    const now = new Date();
    const firstDayCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLast = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentRev = await Order.sum('total_amount', { where: { createdAt: { [Op.gte]: firstDayCurrent } } }) || 0;
    const lastRev = await Order.sum('total_amount', { where: { createdAt: { [Op.gte]: firstDayLast, [Op.lte]: lastDayLast } } }) || 0;
    const refinedRevenueGrowth = lastRev === 0 ? (currentRev > 0 ? 100 : 0) : Math.round(((parseFloat(currentRev) - parseFloat(lastRev)) / parseFloat(lastRev)) * 100);

    const inquiriesGrowth = await calculateGrowth(Inquiry);
    const usersGrowth = await calculateGrowth(User);

    res.json({
      success: true,
      data: {
        productsCount,
        inquiriesCount,
        totalViews,
        totalRevenue: parseFloat(totalRevenue),
        totalOrders,
        revenueGrowth: refinedRevenueGrowth,
        inquiriesGrowth,
        usersGrowth
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ========== REVENUE ANALYTICS (CHART) ==========
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { range = 'year' } = req.query;
    let query;

    if (range === '7days' || range === '30days') {
      const days = range === '7days' ? 7 : 30;
      query = `
        SELECT 
          to_char(date_trunc('day', "created_at"), 'Mon DD') as date,
          SUM(total_amount) as revenue,
          COUNT(id) as orders
        FROM orders
        WHERE "created_at" >= CURRENT_DATE - INTERVAL '${days} days' 
        GROUP BY date_trunc('day', "created_at")
        ORDER BY date_trunc('day', "created_at") ASC
      `;
    } else {
      query = `
        SELECT 
          to_char(date_trunc('month', "created_at"), 'Mon') as date,
          SUM(total_amount) as revenue,
          COUNT(id) as orders
        FROM orders
        WHERE "created_at" >= date_trunc('year', CURRENT_DATE)
        GROUP BY date_trunc('month', "created_at")
        ORDER BY date_trunc('month', "created_at") ASC
      `;
    }

    const data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    res.json({ success: true, data });

  } catch (err) {
    console.error("Revenue analytics error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
