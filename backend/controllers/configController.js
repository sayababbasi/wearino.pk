import Setting from "../models/Setting.js";
import DeliveryZone from "../models/DeliveryZone.js";
import PaymentMethod from "../models/PaymentMethod.js";
import PaymentProof from "../models/PaymentProof.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";

/**
 * Global Settings Management
 */
export const getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSetting = async (req, res) => {
    try {
        const { key, value, group } = req.body;
        let setting = await Setting.findOne({ where: { key } });
        if (setting) {
            await setting.update({ value, group });
        } else {
            setting = await Setting.create({ key, value, group });
        }
        res.json({ success: true, setting });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delivery Zones Management
 */
export const getAllDeliveryZones = async (req, res) => {
    try {
        const zones = await DeliveryZone.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: { zones } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createDeliveryZone = async (req, res) => {
    try {
        const zone = await DeliveryZone.create(req.body);
        res.json({ success: true, zone });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDeliveryZone = async (req, res) => {
    try {
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: "Zone not found" });
        await zone.update(req.body);
        res.json({ success: true, zone });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteDeliveryZone = async (req, res) => {
    try {
        const zone = await DeliveryZone.findByPk(req.params.id);
        if (!zone) return res.status(404).json({ message: "Zone not found" });
        await zone.destroy();
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Payment Methods Management
 */
export const getAllPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.findAll();
        res.json({ success: true, data: { methods } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.create(req.body);
        res.json({ success: true, method });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if (!method) return res.status(404).json({ message: "Method not found" });
        await method.update(req.body);
        res.json({ success: true, method });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deletePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if (!method) return res.status(404).json({ message: "Method not found" });
        await method.destroy();
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Payment Proofs Management
 */
export const uploadPaymentProof = async (req, res) => {
    try {
        const { orderId, transactionId, note } = req.body;
        // When using Cloudinary, req.file.path is the URL
        // When using local storage, we construct the URL
        const screenshot = req.file ? (req.file.path || `/uploads/${req.file.filename}`) : null;

        if (!screenshot) return res.status(400).json({ message: "Screenshot is required" });

        const proof = await PaymentProof.create({
            orderId,
            userId: req.user?.id || null,
            screenshot,
            transactionId,
            note
        });

        const order = await Order.findByPk(orderId);
        if (order) {
            order.status = 'under_review'; 
            order.paymentStatus = 'pending'; 
            order.paymentProofImage = screenshot;
            
            const history = order.statusHistory || [];
            history.push({
                status: 'under_review',
                message: `Payment proof uploaded (${transactionId || 'No ID'}). Under Review by Admin.`,
                timestamp: new Date()
            });
            order.statusHistory = history;
            order.changed('statusHistory', true);
            
            await order.save();
        }

        res.json({ success: true, proof });
    } catch (error) {
        res.status(500).json({ success: false, message: "Upload failed: " + error.message });
    }
};

export const getPaymentProofs = async (req, res) => {
    try {
        const proofs = await PaymentProof.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: { proofs } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const verifyPaymentProof = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const proof = await PaymentProof.findByPk(req.params.id);
        if (!proof) return res.status(404).json({ success: false, message: "Proof not found" });

        await proof.update({ status, adminNote });

        const order = await Order.findByPk(proof.orderId, {
            include: [{ model: OrderItem, include: [Product] }]
        });
        if (order) {
            const history = order.statusHistory || [];
            if (status === 'approved') {
                order.status = 'confirmed';
                order.paymentStatus = 'verified';
                order.rejectionReason = null;
                
                // Inventory Management: Reduce stock when payment is verified
                for (const item of order.OrderItems) {
                    const product = await Product.findByPk(item.productId);
                    if (product) {
                        product.stock = Math.max(0, product.stock - item.quantity);
                        await product.save();
                    }
                }
                
                history.push({
                    status: 'confirmed',
                    message: `Payment verified. Order is now confirmed. ${adminNote || ''}`,
                    timestamp: new Date()
                });
            } else if (status === 'rejected') {
                order.paymentStatus = 'rejected';
                order.status = 'pending_payment'; // Allow user to re-upload
                order.rejectionReason = adminNote;
                
                history.push({
                    status: 'pending_payment',
                    message: `Payment proof rejected. Reason: ${adminNote || 'Invalid details'}`,
                    timestamp: new Date()
                });
            }
            order.statusHistory = history;
            order.changed('statusHistory', true);
            await order.save();
        }

        res.json({ success: true, data: { proof } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
