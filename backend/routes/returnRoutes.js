import express from "express";
import { 
    createReturnRequest, 
    getUserReturnRequests, 
    getAllReturnRequests, 
    updateReturnStatus,
    updateRefundStatus
} from "../controllers/returnController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// User Routes
router.post("/", protect, createReturnRequest);
router.get("/me", protect, getUserReturnRequests);

// Admin Routes (Admins can be restricted via middleware later if needed)
router.get("/admin/all", protect, getAllReturnRequests);
router.put("/admin/:id/status", protect, updateReturnStatus);
router.put("/admin/:id/refund", protect, updateRefundStatus);

export default router;
