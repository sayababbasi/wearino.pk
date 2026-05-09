import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Get database credentials from environment variables
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT || 5432;

// Check if database credentials are set
if (!DB_NAME || !DB_USER) {
    console.warn("⚠️  Database environment variables not set!");
    console.warn("   Set DB_NAME, DB_USER, DB_PASS in .env file");
    console.warn("   Database connection will fail, but backend can still run without DB.");
}

const sequelize = new Sequelize(
    String(DB_NAME || "product_listing_db"),
    String(DB_USER || "postgres"),
    String(DB_PASS || ""),
    {
        host: DB_HOST,
        dialect: "postgres",
        port: DB_PORT,
        logging: false,
    }
);


const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("DataBase connected successfully");

        // Force conversion of contents.type from ENUM to VARCHAR if needed
        // This avoids "invalid input value for enum" errors when adding new types
        try {
            await sequelize.query(`
                DO $$ 
                BEGIN 
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'contents' AND column_name = 'type' 
                        AND data_type = 'USER-DEFINED'
                    ) THEN
                        ALTER TABLE "contents" ALTER COLUMN "type" TYPE VARCHAR(255);
                    END IF;
                END $$;
            `);
        } catch (e) {
            console.log("Optional migration: contents.type already converted or table doesn't exist yet.");
        }

        await sequelize.sync({ alter: true });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

export { sequelize, connectDB };