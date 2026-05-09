import Message from "../models/Message.js";
import { sequelize } from "../config/db.js";

// Get all messages for all conversations (Admin only)
// Returns ALL messages so the frontend can build conversation metadata (last message, escalation status, etc.)
export const getConversations = async (req, res) => {
    try {
        // Fetch last message per conversation using a subquery approach
        const results = await sequelize.query(`
            SELECT DISTINCT ON ("conversationId") 
                id, "conversationId", "senderRole", content, "isRead", "createdAt"
            FROM "Messages"
            ORDER BY "conversationId", "createdAt" DESC
        `, { type: sequelize.QueryTypes?.SELECT || 'SELECT' });

        res.json(results);
    } catch (error) {
        // Fallback: return all messages and let frontend group them
        try {
            const messages = await Message.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.json(messages);
        } catch (err) {
            console.error("Error fetching conversations:", err);
            res.status(500).json({ message: "Server Error" });
        }
    }
};

// Get all messages for a specific conversation (ordered oldest first)
export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    try {
        const messages = await Message.findAll({
            where: { conversationId },
            order: [['createdAt', 'ASC']]
        });

        // Mark all unread messages in this conversation as read
        await Message.update(
            { isRead: true },
            { where: { conversationId, senderRole: ['user', 'guest'], isRead: false } }
        );

        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
