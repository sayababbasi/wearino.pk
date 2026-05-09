
import { sequelize } from "./config/db.js";
import Category from "./models/Category.js";

const checkCategories = async () => {
    try {
        await sequelize.authenticate();
        console.log("DB Connected");

        const categories = await Category.findAll();
        console.log(`Total Categories in DB: ${categories.length}`);
        categories.forEach(c => console.log(`- ${c.id}: ${c.name} (${c.status})`));

        if (categories.length === 0) {
            console.log("Creating default category...");
            await Category.create({
                name: "Women",
                description: "Women's Fashion",
                status: "active"
            });
            console.log("Created 'Women' category.");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
};

checkCategories();
