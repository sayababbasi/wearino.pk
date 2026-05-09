import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, isAdmin, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
const router = express.Router();

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: List of all categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       500:
 *         description: Server error
 */
router.get("/", getAllCategories);

/**
 * @swagger
 * /api/category/{id}:
 *   get:
 *     summary: Get single category by ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getCategoryById);

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Electronics"
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Category already exists
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
// Create (Admin only)
router.post("/", protect, isAdmin, upload.single("image"), createCategory);

// Update (Admin only)
router.put("/:id", protect, isAdmin, upload.single("image"), updateCategory);

// Delete (Admin only)
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
