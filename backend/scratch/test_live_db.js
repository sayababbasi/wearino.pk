
import { sequelize, connectDB } from '../config/db.js';
import Content from '../models/Content.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

async function test() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        
        console.log('Fetching content...');
        const content = await Content.findAll();
        console.log('Content count:', content.length);
        
        console.log('Fetching products...');
        const products = await Product.findAll();
        console.log('Product count:', products.length);
        
        console.log('Fetching categories...');
        const categories = await Category.findAll();
        console.log('Category count:', categories.length);
        
        if (products.length > 0) {
            console.log('Sample product:', products[0].name, 'Price:', products[0].price);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('DATABASE TEST FAILED:');
        console.error(error);
        process.exit(1);
    }
}

test();
