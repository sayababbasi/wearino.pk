import { DataTypes } from "sequelize";
import {sequelize }from "../config/db.js";
import User from "./User.js";

const ChatLog = sequelize.define("ChatLog", {
  chat_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  bot_reply: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

// RELATION
User.hasMany(ChatLog, { foreignKey: "user_id", onDelete: "CASCADE" });
ChatLog.belongsTo(User, { foreignKey: "user_id" });

export default ChatLog;
