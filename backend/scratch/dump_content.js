
import { sequelize } from '../config/db.js';
import Content from '../models/Content.js';

async function dumpContent() {
    try {
        await sequelize.authenticate();
        const content = await Content.findAll();
        console.log(JSON.stringify(content, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

dumpContent();
