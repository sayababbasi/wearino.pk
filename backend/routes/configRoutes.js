import express from "express";
import { protect, isAdmin, optionalAuth } from "../middleware/authMiddleware.js";
import {
    getSettings,
    updateSetting,
    getAllDeliveryZones,
    createDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    getAllPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    uploadPaymentProof,
    getPaymentProofs,
    verifyPaymentProof
} from "../controllers/configController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Settings
router.get("/settings", getSettings);
router.post("/settings", protect, isAdmin, updateSetting);

// Delivery Zones
router.get("/delivery-zones", getAllDeliveryZones);
router.post("/delivery-zones", protect, isAdmin, createDeliveryZone);
router.put("/delivery-zones/:id", protect, isAdmin, updateDeliveryZone);
router.delete("/delivery-zones/:id", protect, isAdmin, deleteDeliveryZone);

// Payment Methods
router.get("/payment-methods", getAllPaymentMethods);
router.post("/payment-methods", protect, isAdmin, createPaymentMethod);
router.put("/payment-methods/:id", protect, isAdmin, updatePaymentMethod);
router.delete("/payment-methods/:id", protect, isAdmin, deletePaymentMethod);

// Payment Proofs
router.post("/payment-proofs/upload", optionalAuth, upload.single('screenshot'), uploadPaymentProof);
router.get("/payment-proofs", protect, isAdmin, getPaymentProofs);
router.put("/payment-proofs/:id/verify", protect, isAdmin, verifyPaymentProof);

export default router;
