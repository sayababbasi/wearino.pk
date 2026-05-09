import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Message = sequelize.define("Message", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    // We use a conversation ID to group messages.
    // Format: "user_{id}" or "guest_{randomId}"
    conversationId: {
        type: DataTypes.STRING,
        allowNull: false,
        index: true,
    },
    senderId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Null if guest (we identify by conversationId)
    },
    senderRole: {
        type: DataTypes.STRING, // Changed from ENUM to avoid DB sync issues
        allowNull: false,
        defaultValue: 'user',
        validate: {
            isIn: [['user', 'admin', 'guest']]
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

export default Message;
