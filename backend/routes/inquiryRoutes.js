import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import {
  createInquiry,
  getInquiries,
} from "../controllers/inquiryController.js";

const router = express.Router();

router.post("/", createInquiry);       // Public (guest allowed)
router.get("/", protect, isAdmin, getInquiries); // Admin can view all

export default router;
