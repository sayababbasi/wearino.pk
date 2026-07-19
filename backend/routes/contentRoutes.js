/**
 * Content Routes
 * 
 * Defines API endpoints for managing dynamic content.
 * 
 * @module routes/contentRoutes
 */

import express from "express";
import {
    getContent,
    createContent,
    updateContent,
    deleteContent,
} from "../controllers/contentController.js";
import { protect, isAdmin, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import { cacheMiddleware } from "../middleware/cacheMiddleware.js";

const router = express.Router();

/**
 * Public Routes
 */
// Get all content (filtered by query params)
router.get("/", cacheMiddleware(300), getContent);

/**
 * Protected Routes (Admin/Manager)
 */
// Create content with image upload
router.post("/", protect, isAdmin, upload.single("image"), createContent);

// Update content with optional image upload
router.put("/:id", protect, isAdmin, upload.single("image"), updateContent);

// Delete content (Admin)
router.delete("/:id", protect, isAdmin, deleteContent);

export default router;
