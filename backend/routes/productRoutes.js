import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getTopSellingProducts
} from "../controllers/productController.js";
import upload from "../middleware/upload.js";
import { protect, isAdmin, optionalAuth, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/product:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of all products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Server error
 */
router.get("/", getAllProducts);

/**
 * @swagger
 * /api/product/top:
 *   get:
 *     summary: Get top selling products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of top selling products
 *       500:
 *         description: Server error
 */
router.get("/top", getTopSellingProducts);

/**
 * @swagger
 * /api/product/{id}:
 *   get:
 *     summary: Get single product by ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getProductById);

/**
 * @swagger
 * /api/product:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Product already exists
 *       403:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
// Create (Admin only)
router.post("/", protect, isAdmin, upload.array("images", 5), createProduct);

/**
 * @swagger
 * /api/product/{id}:
 *   put:
 *     summary: Update product (Admin only)
...
 */
router.put("/:id", protect, isAdmin, upload.array("newImages", 10), updateProduct);

/**
 * @swagger
 * /api/product/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
...
 */
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
