
import { sequelize } from "./config/db.js";
import Order from "./models/Order.js";

const checkStatus = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        const statusCounts = await Order.findAll({
            attributes: ['paymentStatus', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['paymentStatus'],
            raw: true
        });

        console.log("Payment Status Distribution:", statusCounts);

        const totalOrders = await Order.count();
        console.log("Total Orders:", totalOrders);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
};

checkStatus();
