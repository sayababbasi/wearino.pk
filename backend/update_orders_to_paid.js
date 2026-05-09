
import { sequelize } from "./config/db.js";
import Order from "./models/Order.js";

const updateOrders = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        const result = await Order.update(
            { paymentStatus: 'paid' },
            { where: { paymentStatus: 'pending' } }
        );

        console.log(`Updated ${result[0]} orders to 'paid' status.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sequelize.close();
    }
};

updateOrders();
