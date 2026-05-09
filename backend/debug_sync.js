import { sequelize } from './config/db.js';
import './models/User.js';
import './models/Category.js';
import './models/Product.js';
import './models/Order.js';
import './models/OrderItem.js';
import './models/Review.js';
import './models/Coupon.js';
import './models/Message.js';
import './models/ProductVariant.js';

const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
};

syncDB();
