import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Setting = sequelize.define("Setting", {
    key: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    value: {
        type: DataTypes.JSON,
        allowNull: false
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: 'general'
    }
}, {
    tableName: "settings",
    timestamps: true
});

export default Setting;
