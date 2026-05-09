import { sequelize } from './config/db.js';
import './models/Order.js';
import './models/OrderItem.js';

const cleanDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Check counts
        const [orders] = await sequelize.query('SELECT COUNT(*) FROM "orders"');
        const [orderItems] = await sequelize.query('SELECT COUNT(*) FROM "OrderItems"');

        console.log(`Orders count: ${orders[0].count}`);
        console.log(`OrderItems count: ${orderItems[0].count}`);

        // Delete orphaned OrderItems
        // We use raw query because models might not be fully synced yet
        await sequelize.query('DELETE FROM "OrderItems" WHERE "orderId" NOT IN (SELECT id FROM "orders")');
        console.log('Orphaned OrderItems deleted.');

        await sequelize.sync({ alter: true });
        console.log('Database synced successfully after cleanup.');

    } catch (error) {
        console.error('Error cleaning DB:', error);
    } finally {
        await sequelize.close();
    }
};

cleanDB();
