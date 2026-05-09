
import { sequelize } from "./config/db.js";
import Order from "./models/Order.js";
import { Op } from "sequelize";

const debugAnalytics = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        // Check all orders
        const allOrders = await Order.findAll({
            attributes: ['id', 'total', 'paymentStatus', 'createdAt']
        });
        console.log("All Orders:", JSON.stringify(allOrders, null, 2));

        // Test the specific aggregation query
        const totalRevenue = await Order.sum('total', { where: { paymentStatus: 'paid' } });
        console.log("Calculated Total Revenue (paid):", totalRevenue);

        // Test case sensitivity check
        const paidOrders = await Order.findAll({ where: { paymentStatus: 'paid' } });
        console.log("Orders matching paymentStatus='paid':", paidOrders.length);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
};

debugAnalytics();
