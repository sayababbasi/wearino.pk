/**
 * Review Controller
 * 
 * Handles customer product reviews with verified purchase validation
 */

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";
import { Op } from "sequelize";

/**
 * Create a new review
 * Validates that user purchased the product before allowing review
 */
export const createReview = async (req, res) => {
    try {
        const { productId, rating, reviewText } = req.body;
        const userId = req.user.id; // From auth middleware

        if (!productId || !rating) {
            return res.status(400).json({
                success: false,
                message: "Product ID and rating are required"
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            where: { productId, userId }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: "You have already reviewed this product"
            });
        }

        // Verify purchase - check if user has a DELIVERED order with this product
        const userOrders = await Order.findAll({
            where: { 
              userId,
              status: 'delivered' // Only delivered orders can be reviewed
            },
            include: [{
                model: OrderItem,
                where: { productId }
            }]
        });

        if (!userOrders || userOrders.length === 0) {
            return res.status(403).json({
                success: false,
                message: "You can only review products from delivered orders"
            });
        }

        const orderId = userOrders[0].id;
        const isVerifiedPurchase = true;

        // Create review
        const review = await Review.create({
            productId,
            userId,
            orderId,
            rating,
            reviewText: reviewText || null,
            isVerifiedPurchase,
            isApproved: true // Auto-approve by default
        });

        // Fetch review with user info
        const reviewWithUser = await Review.findByPk(review.id, {
            include: [{
                model: User,
                as: "user",
                attributes: ['id', 'name', 'email']
            }]
        });

        res.status(201).json({
            success: true,
            review: reviewWithUser
        });
    } catch (error) {
        console.error("Error creating review:", error);
        res.status(500).json({ success: false, message: "Failed to create review" });
    }
};

/**
 * Get all reviews for a product
 */
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const reviews = await Review.findAll({
            where: {
                productId,
                isApproved: true // Only show approved reviews
            },
            include: [{
                model: User,
                as: "user",
                attributes: ['id', 'name']
            }],
            order: [['createdAt', 'DESC']]
        });

        // Calculate average rating
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        res.json({
            success: true,
            reviews,
            stats: {
                totalReviews: reviews.length,
                averageRating: parseFloat(avgRating.toFixed(1))
            }
        });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

/**
 * Get current user's reviews
 */
export const getUserReviews = async (req, res) => {
    try {
        const userId = req.user.id;

        const reviews = await Review.findAll({
            where: { userId },
            include: [
                {
                    model: Product,
                    as: "product",
                    attributes: ['id', 'name', 'images']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            reviews
        });
    } catch (error) {
        console.error("Error fetching user reviews:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user reviews" });
    }
};

/**
 * Get products that the user has purchased (delivered) but not yet reviewed
 */
export const getPendingReviewProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all delivered orders for the user
        const userOrders = await Order.findAll({
            where: { 
              userId,
              status: 'delivered'
            },
            include: [{
                model: OrderItem,
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'images', 'price']
                }]
            }]
        });

        // Extract all products from delivered orders
        const purchasedProductsMap = new Map();
        userOrders.forEach(order => {
            order.OrderItems.forEach(item => {
                if (item.product && item.productId) {
                    // Only add if not already added to avoid duplicates
                    if (!purchasedProductsMap.has(item.productId)) {
                        purchasedProductsMap.set(item.productId, {
                            ...item.product.toJSON(),
                            orderId: order.id,
                            purchasedAt: order.createdAt
                        });
                    }
                }
            });
        });

        const purchasedProductIds = Array.from(purchasedProductsMap.keys());

        if (purchasedProductIds.length === 0) {
            return res.json({ success: true, products: [] });
        }

        // Find reviews the user has already written for these products
        const existingReviews = await Review.findAll({
            where: {
                userId,
                productId: {
                    [Op.in]: purchasedProductIds
                }
            },
            attributes: ['productId']
        });

        const reviewedProductIds = new Set(existingReviews.map(r => r.productId));

        // Filter out products that have already been reviewed
        const pendingProducts = Array.from(purchasedProductsMap.values())
            .filter(product => !reviewedProductIds.has(product.id))
            .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt));

        res.json({
            success: true,
            products: pendingProducts
        });
    } catch (error) {
        console.error("Error fetching pending review products:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending review products" });
    }
};

/**
 * Update user's own review
 */
export const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, reviewText } = req.body;
        const userId = req.user.id;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Verify ownership
        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only update your own reviews"
            });
        }

        await review.update({
            rating: rating || review.rating,
            reviewText: reviewText !== undefined ? reviewText : review.reviewText
        });

        const updatedReview = await Review.findByPk(id, {
            include: [{
                model: User,
                as: "user",
                attributes: ['id', 'name']
            }]
        });

        res.json({ success: true, review: updatedReview });
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).json({ success: false, message: "Failed to update review" });
    }
};

/**
 * Delete user's own review
 */
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Verify ownership
        if (review.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own reviews"
            });
        }

        await review.destroy();
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
};

/**
 * Admin: Get all reviews
 */
export const getAllReviews = async (req, res) => {
    try {
        const { status } = req.query; // 'approved', 'pending', or all if undefined

        const where = {};
        if (status === 'approved') where.isApproved = true;
        if (status === 'pending') where.isApproved = false;

        const reviews = await Review.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Product,
                    as: "product", // Ensure this alias matches model association
                    attributes: ['id', 'name', 'images']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, reviews });
    } catch (error) {
        console.error("Error fetching admin reviews:", error);
        res.status(500).json({ success: false, message: "Failed to fetch reviews" });
    }
};

/**
 * Admin: Delete any review (moderation)
 */
export const adminDeleteReview = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        await review.destroy();
        res.json({ success: true, message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({ success: false, message: "Failed to delete review" });
    }
};

/**
 * Admin: Toggle review approval
 */
export const toggleReviewApproval = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await Review.findByPk(id);

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        await review.update({ isApproved: !review.isApproved });

        res.json({
            success: true,
            review,
            message: `Review ${review.isApproved ? 'approved' : 'hidden'}`
        });
    } catch (error) {
        console.error("Error toggling review approval:", error);
        res.status(500).json({ success: false, message: "Failed to update review" });
    }
};

/**
 * Check if user can review a product (has purchased it)
 */
export const canUserReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        // Check if already reviewed
        const existingReview = await Review.findOne({
            where: { productId, userId }
        });

        if (existingReview) {
            return res.json({
                success: true,
                canReview: false,
                reason: "already_reviewed",
                existingReview
            });
        }

        // Check if purchased and DELIVERED
        const userOrders = await Order.findAll({
            where: { 
              userId,
              status: 'delivered'
            },
            include: [{
                model: OrderItem,
                where: { productId }
            }]
        });

        const hasPurchased = userOrders && userOrders.length > 0;

        res.json({
            success: true,
            canReview: hasPurchased,
            reason: hasPurchased ? "can_review" : (userOrders.length === 0 ? "not_delivered_or_not_purchased" : "not_delivered")
        });
    } catch (error) {
        console.error("Error checking review permission:", error);
        res.status(500).json({ success: false, message: "Failed to check permission" });
    }
};
