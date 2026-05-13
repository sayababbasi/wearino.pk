import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const DeliveryZone = sequelize.define("DeliveryZone", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // e.g., Lahore, Karachi, Punjab
    },
    charge: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00
    },
    freeDeliveryThreshold: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    estimatedDays: {
        type: DataTypes.STRING,
        defaultValue: '3-5 Days'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: "delivery_zones",
    timestamps: true
});

export default DeliveryZone;
