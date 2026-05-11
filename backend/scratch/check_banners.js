
import { sequelize } from '../config/db.js';
import Content from '../models/Content.js';

async function checkContent() {
    try {
        await sequelize.authenticate();
        const content = await Content.findAll({
            where: { type: 'banner' }
        });
        
        console.log('--- BANNERS IN DB ---');
        content.forEach(c => {
            console.log(`Title: ${c.title}`);
            console.log(`Image URL: ${c.imageUrl}`);
            console.log(`Position: ${c.position}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await sequelize.close();
    }
}

checkContent();
