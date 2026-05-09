import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || "product_listing_db",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "",
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "postgres",
        port: process.env.DB_PORT || 5432,
        logging: false,
    }
);

async function fix() {
    try {
        await sequelize.authenticate();
        console.log("Connected.");

        // 1. Fix contents table
        const [contentsCols] = await sequelize.query("SELECT data_type FROM information_schema.columns WHERE table_name = 'contents' AND column_name = 'type'");
        if (contentsCols.length > 0 && contentsCols[0].data_type === 'USER-DEFINED') {
            console.log("Converting contents.type from ENUM to VARCHAR...");
            await sequelize.query('ALTER TABLE "contents" ALTER COLUMN "type" TYPE VARCHAR(255) USING "type"::text');
            console.log("Done.");
        }

        // 2. Fix orders table name mismatch
        // If "Orders" exists but "orders" is expected
        const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        const tableNames = tables.map(t => t.table_name);
        console.log("Current tables:", tableNames);

        if (tableNames.includes('Orders') && !tableNames.includes('orders')) {
            console.log("Renaming Orders to orders...");
            await sequelize.query('ALTER TABLE "Orders" RENAME TO "orders"');
        }

        console.log("Database fix script completed.");
    } catch (e) {
        console.error("Fix script error:", e);
    } finally {
        await sequelize.close();
    }
}

fix();
