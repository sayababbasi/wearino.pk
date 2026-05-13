import Product from './models/Product.js';
import { sequelize } from './config/db.js';

async function check() {
    try {
        await sequelize.authenticate();
        const products = await Product.findAll();
        products.forEach(p => {
            console.log(`Product: ${p.name}, Tags: ${JSON.stringify(p.tags)}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
