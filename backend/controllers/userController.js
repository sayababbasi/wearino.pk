import User from "../models/User.js";
import Order from "../models/Order.js";
import { Sequelize } from "sequelize";

/**
 * Get All Users (Admin Only)
 * 
 * Fetches all users with their order statistics.
 * Requires admin authentication.
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    // Get order statistics for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const stats = await Order.findOne({
          where: { userId: user.id },
          attributes: [
            [Sequelize.fn("COUNT", Sequelize.col("id")), "orderCount"],
            [Sequelize.fn("SUM", Sequelize.col("total_amount")), "totalSpent"],
          ],
          raw: true
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orders: parseInt(stats?.orderCount || 0),
          totalSpent: parseFloat(stats?.totalSpent || 0),
          joinedDate: user.createdAt,
        };
      })
    );

    res.json({ success: true, users: usersWithStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Create User (Admin Only)
 * 
 * Creates a new user with a specific role.
 * Requires admin authentication.
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["user", "admin", "manager", "assistant"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password (need to import bcrypt in this file)
    // Dynamic import to avoid top-level import issues if not configured
    const bcrypt = await import("bcryptjs").then(m => m.default);
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Update User Role (Admin Only)
 * 
 * Updates a user's role.
 * Requires admin authentication.
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin", "manager", "assistant"].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user', 'admin', 'manager', or 'assistant'" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete User (Admin Only)
 * 
 * Deletes a user account.
 * Requires admin authentication.
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
