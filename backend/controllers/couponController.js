/**
 * Coupon Controller
 * 
 * Handles CRUD operations and validation for discount coupons
 */

import Coupon from "../models/Coupon.js";
import { Op } from "sequelize";

/**
 * Get all coupons (Admin only)
 */
export const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, coupons });
    } catch (error) {
        console.error("Error fetching coupons:", error);
        res.status(500).json({ success: false, message: "Failed to fetch coupons" });
    }
};

/**
 * Get single coupon by ID (Admin only)
 */
export const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        res.json({ success: true, coupon });
    } catch (error) {
        console.error("Error fetching coupon:", error);
        res.status(500).json({ success: false, message: "Failed to fetch coupon" });
    }
};

/**
 * Create new coupon (Admin only)
 */
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discountType,
            discountValue,
            minPurchase,
            maxDiscount,
            startDate,
            expiryDate,
            usageLimit,
            applicableProducts,
            description,
            isActive
        } = req.body;

        // Validate required fields
        if (!code || !discountType || !discountValue) {
            return res.status(400).json({
                success: false,
                message: "Code, discount type, and discount value are required"
            });
        }

        // Create coupon
        const coupon = await Coupon.create({
            code: code.toUpperCase(), // Force uppercase
            discountType,
            discountValue,
            minPurchase: minPurchase || null,
            maxDiscount: maxDiscount || null,
            startDate: startDate || null,
            expiryDate: expiryDate || null,
            usageLimit: usageLimit || null,
            applicableProducts: applicableProducts || null,
            description: description || null,
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        console.error("Error creating coupon:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        res.status(500).json({ success: false, message: "Failed to create coupon" });
    }
};

/**
 * Update coupon (Admin only)
 */
export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const coupon = await Coupon.findByPk(id);
        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        // Force uppercase for code if being updated
        if (updates.code) {
            updates.code = updates.code.toUpperCase();
        }

        await coupon.update(updates);
        res.json({ success: true, coupon });
    } catch (error) {
        console.error("Error updating coupon:", error);

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: "Coupon code already exists"
            });
        }

        res.status(500).json({ success: false, message: "Failed to update coupon" });
    }
};

/**
 * Delete coupon (Admin only)
 */
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findByPk(id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }

        await coupon.destroy();
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        console.error("Error deleting coupon:", error);
        res.status(500).json({ success: false, message: "Failed to delete coupon" });
    }
};

/**
 * Validate coupon code (Customer-facing)
 * Checks if coupon exists, is active, not expired, and meets requirements
 */
export const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal, productIds } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Coupon code is required"
            });
        }

        // Find coupon (case-insensitive)
        const coupon = await Coupon.findOne({
            where: { code: code.toUpperCase() }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: "Invalid coupon code"
            });
        }

        // Check if active
        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: "This coupon code is no longer valid"
            });
        }

        // Check start date
        const now = new Date();
        if (coupon.startDate && new Date(coupon.startDate) > now) {
            return res.status(400).json({
                success: false,
                message: "This coupon is not yet valid"
            });
        }

        // Check expiry date
        if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
            return res.status(400).json({
                success: false,
                message: "This coupon has expired"
            });
        }

        // Check usage limit
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({
                success: false,
                message: "This coupon code has reached its limit and is no longer valid"
            });
        }

        // Check minimum purchase
        if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
            return res.status(400).json({
                success: false,
                message: `Minimum purchase of Rs ${coupon.minPurchase} required`
            });
        }

        // Check applicable products
        if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
            const hasApplicableProduct = productIds && productIds.some(id =>
                coupon.applicableProducts.includes(id)
            );

            if (!hasApplicableProduct) {
                return res.status(400).json({
                    success: false,
                    message: "This coupon does not apply to items in your cart"
                });
            }
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discountType === 'percentage') {
            discountAmount = (cartTotal * coupon.discountValue) / 100;
            // Apply max discount cap if set
            if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
                discountAmount = coupon.maxDiscount;
            }
        } else if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountValue;
            // Don't let discount exceed cart total
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal;
            }
        }

        res.json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount: parseFloat((Number(discountAmount) || 0).toFixed(2))
            }
        });
    } catch (error) {
        console.error("Error validating coupon:", error);
        res.status(500).json({ success: false, message: "Failed to validate coupon" });
    }
};
