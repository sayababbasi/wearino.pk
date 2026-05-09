import express from "express";
import { getConversations, getMessages } from "../controllers/messageController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all conversations (Admin only)
router.get("/conversations", protect, isAdmin, getConversations);

// Get messages for a specific conversation
// Note: We might want to allow public access for guests if they have the conversationId (e.g. stored in local storage)
// For now, let's keep it open or require a token if it's a registered user.
router.get("/:conversationId", getMessages);

export default router;
