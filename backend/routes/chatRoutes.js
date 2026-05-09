import express from "express";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { sendMessage, getChatHistory } from "../controllers/chatController.js";

const router = express.Router();

router.post("/send", optionalAuth, sendMessage);
router.get("/history", optionalAuth, getChatHistory);

export default router;
