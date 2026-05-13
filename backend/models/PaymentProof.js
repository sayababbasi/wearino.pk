import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const PaymentProof = sequelize.define("PaymentProof", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    screenshot: {
        type: DataTypes.STRING, // File path/URL
        allowNull: false
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING, // 'pending', 'approved', 'rejected'
        defaultValue: 'pending'
    },
    adminNote: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: "payment_proofs",
    timestamps: true
});

export default PaymentProof;
