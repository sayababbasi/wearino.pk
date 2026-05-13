/**
 * Content Controller
 * 
 * Handles CRUD operations for dynamic homepage content (Banners, Announcements, etc.)
 * 
 * @module controllers/contentController
 */

import Content from "../models/Content.js";
import Product from "../models/Product.js";

/**
 * Get All Content
 * 
 * Fetches all active content items, optionally filtered by type.
 * Public endpoint for frontend to render homepage.
 * For 'featured_product' type, includes the associated Product data.
 */
export const getContent = async (req, res) => {
    try {
        const { type, position, all, admin } = req.query;
        const whereClause = {};

        // Only filter by active if not explicitly requested all or from admin
        if (all !== 'true' && admin !== 'true') {
            whereClause.isActive = true;
        }

        if (type) whereClause.type = type;
        if (position) whereClause.position = position;

        // Include Product data for featured_product type
        const includeOptions = [];
        if (!type || type === 'featured_product') {
            includeOptions.push({
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'price', 'images', 'description', 'stock']
            });
        }

        const content = await Content.findAll({
            where: whereClause,
            include: includeOptions,
            order: [['order', 'ASC'], ['createdAt', 'DESC']],
        });

        res.status(200).json({ success: true, data: { content } });
    } catch (error) {
        console.error("Error fetching content:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Create Content (Admin)
 */
export const createContent = async (req, res) => {
    try {
        const { type, title, linkUrl, position, order, isActive, meta, productId } = req.body;
        let imageUrl = req.body.imageUrl;

        // Handle file upload if present
        if (req.file) {
            let path = req.file.path;
            // If local storage, use the relative path for the database
            if (!path.startsWith('http')) {
                path = `uploads/${req.file.filename}`;
            }
            imageUrl = path;
        }

        // Parse types for FormData compatibility (strings from FormData to actual types)
        const parsedOrder = order ? parseInt(order) : 0;
        const parsedIsActive = isActive === 'false' ? false : true;
        const parsedProductId = productId ? parseInt(productId) : null;

        let parsedMeta = {};
        if (meta) {
            try {
                parsedMeta = typeof meta === 'string' ? JSON.parse(meta) : meta;
            } catch (e) {
                console.error("Meta parse error:", e);
                parsedMeta = {};
            }
        }

        const newContent = await Content.create({
            type,
            title,
            imageUrl,
            linkUrl,
            position,
            productId: parsedProductId,
            order: parsedOrder,
            isActive: parsedIsActive,
            meta: parsedMeta,
        });

        // If it's a featured product, fetch the content with product data
        if (type === 'featured_product' && parsedProductId) {
            const contentWithProduct = await Content.findByPk(newContent.id, {
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'images', 'description', 'stock']
                }]
            });
            return res.status(201).json({ success: true, data: { content: contentWithProduct } });
        }

        res.status(201).json({ success: true, data: { content: newContent } });
    } catch (error) {
        console.error("Error creating content:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            error: error.toString()
        });
    }
};

/**
 * Update Content (Admin)
 */
export const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, linkUrl, position, order, isActive, meta, productId } = req.body;

        console.log(`Updating Content ID: ${id}`);
        console.log('Body:', req.body);
        if (req.file) console.log('File:', req.file.filename);

        // Check if content exists
        const content = await Content.findByPk(id);
        if (!content) return res.status(404).json({ message: "Content not found" });

        const updateData = {
            title,
            linkUrl,
            position,
        };

        if (productId !== undefined && productId !== 'null' && productId !== '') {
            const pid = parseInt(productId);
            if (!isNaN(pid)) updateData.productId = pid;
        }

        if (order !== undefined && order !== '') {
            const ord = parseInt(order);
            if (!isNaN(ord)) updateData.order = ord;
        }

        if (isActive !== undefined) {
            updateData.isActive = (isActive === 'false' || isActive === false) ? false : true;
        }

        if (meta) {
            try {
                updateData.meta = typeof meta === 'string' ? JSON.parse(meta) : meta;
            } catch (e) {
                console.error("Meta parse error:", e);
            }
        }

        // Handle file upload
        if (req.file) {
            let path = req.file.path;
            // If local storage, use the relative path for the database
            if (!path.startsWith('http')) {
                path = `uploads/${req.file.filename}`;
            }
            updateData.imageUrl = path;
        }

        await content.update(updateData);

        // If it's a featured product, return with product data
        if (content.type === 'featured_product') {
            const contentWithProduct = await Content.findByPk(id, {
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'images', 'description', 'stock']
                }]
            });
            return res.status(200).json({ success: true, data: { content: contentWithProduct } });
        }

        res.status(200).json({ success: true, data: { content } });
    } catch (error) {
        console.error("Error updating content:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
            error: error.toString()
        });
    }
};

/**
 * Delete Content (Admin)
 */
export const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await Content.findByPk(id);

        if (!content) return res.status(404).json({ message: "Content not found" });

        await content.destroy();

        res.status(200).json({ success: true, message: "Content deleted successfully" });
    } catch (error) {
        console.error("Error deleting content:", error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

