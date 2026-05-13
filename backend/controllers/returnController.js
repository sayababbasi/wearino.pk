import ReturnRequest from "../models/ReturnRequest.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

/**
 * Create a new return request (Per Product)
 */
export const createReturnRequest = async (req, res) => {
    try {
        const { orderId, productId, reason, description, images } = req.body;
        const userId = req.user.id;

        // 1. Validate order existence, ownership, and status
        const order = await Order.findOne({
            where: { id: orderId, userId, status: 'delivered' }
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: "Eligible order not found. Only delivered orders can be returned." 
            });
        }

        // 2. Check if this product was actually in the order
        const itemInOrder = await OrderItem.findOne({
            where: { orderId, productId }
        });

        if (!itemInOrder) {
            return res.status(400).json({ 
                success: false, 
                message: "Product not found in this order." 
            });
        }

        // 3. Check if return already exists for this specific product in this order
        const existingRequest = await ReturnRequest.findOne({
            where: { orderId, productId }
        });

        if (existingRequest) {
            return res.status(400).json({ 
                success: false, 
                message: "A return request already exists for this product." 
            });
        }

        // 4. Create request
        const returnRequest = await ReturnRequest.create({
            orderId,
            userId,
            productId,
            reason,
            description,
            images: images || [],
            status: 'pending',
            refundStatus: 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Return request submitted successfully.",
            returnRequest
        });
    } catch (error) {
        console.error("DETAILED ERROR creating return request:", error);
        res.status(500).json({ success: false, message: "Failed to submit return request", error: error.message });
    }
};

/**
 * Get all return requests for the current user
 */
export const getUserReturnRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const requests = await ReturnRequest.findAll({
            where: { userId },
            include: [
                { model: Order, as: 'order', attributes: ['orderNumber', 'createdAt'] },
                { model: Product, as: 'product', attributes: ['name', 'images', 'price'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, requests });
    } catch (error) {
        console.error("DETAILED ERROR fetching user return requests:", error);
        res.status(500).json({ success: false, message: "Failed to fetch return requests", error: error.message });
    }
};

/**
 * Admin: Get all return requests
 */
export const getAllReturnRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};

        const requests = await ReturnRequest.findAll({
            where,
            include: [
                { model: Order, as: 'order', attributes: ['orderNumber'] },
                { model: User, as: 'user', attributes: ['name', 'email'] },
                { model: Product, as: 'product', attributes: ['name', 'images'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, requests });
    } catch (error) {
        console.error("Error fetching all return requests:", error);
        res.status(500).json({ success: false, message: "Failed to fetch return requests" });
    }
};

/**
 * Admin: Update return request status
 */
export const updateReturnStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body;

        const request = await ReturnRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        const updateData = { status };
        if (adminNote !== undefined) updateData.adminNote = adminNote;

        await request.update(updateData);

        res.json({ success: true, message: "Status updated", request });
    } catch (error) {
        console.error("Error updating return status:", error);
        res.status(500).json({ success: false, message: "Failed to update status" });
    }
};

/**
 * Admin: Update refund status
 */
export const updateRefundStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { refundStatus } = req.body;

        const request = await ReturnRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({ success: false, message: "Request not found" });
        }

        await request.update({ refundStatus });

        res.json({ success: true, message: "Refund status updated", request });
    } catch (error) {
        console.error("Error updating refund status:", error);
        res.status(500).json({ success: false, message: "Failed to update refund status" });
    }
};
