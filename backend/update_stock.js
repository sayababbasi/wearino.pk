
import { sequelize } from './config/db.js';
import Product from './models/Product.js';

const updateStock = async () => {
    try {
        await sequelize.authenticate();
        const product = await Product.findByPk(14);
        if (product) {
            product.stock = 100;
            await product.save();
            console.log('Product 14 stock updated to 100');
        } else {
            console.log('Product 14 not found');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

updateStock();
