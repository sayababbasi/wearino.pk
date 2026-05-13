import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PaymentMethod = sequelize.define("PaymentMethod", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.STRING, // 'cod', 'bank_transfer', 'easypaisa', 'jazzcash'
        allowNull: false
    },
    providerName: {
        type: DataTypes.STRING, // e.g., Meezan Bank, JazzCash
        allowNull: false
    },
    accountTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    accountNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    iban: {
        type: DataTypes.STRING,
        allowNull: true
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    extraFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.00 // Optional COD fee
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: "payment_methods",
    timestamps: true
});

export default PaymentMethod;
