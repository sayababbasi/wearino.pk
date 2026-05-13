import Product from './models/Product.js';
import Category from './models/Category.js';
import { sequelize } from './config/db.js';

async function check() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected');
        const count = await Product.count();
        console.log(`Product count: ${count}`);
        const cats = await Category.count();
        console.log(`Category count: ${cats}`);
        
        const saleProducts = await Product.findAll({
            where: {
                status: 'active'
            }
        });
        console.log(`Active products: ${saleProducts.length}`);
        
        if (saleProducts.length > 0) {
            console.log('Sample product tags:', saleProducts[0].tags);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
