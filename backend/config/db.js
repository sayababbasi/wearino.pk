import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("CRITICAL ERROR: DATABASE_URL environment variable is not set!");
    process.exit(1);
}

try {
    const url = new URL(DATABASE_URL);
    console.log(`📡 Attempting to connect to DB Host: ${url.hostname}`);
} catch (e) {
    console.log("📡 Attempting to connect to DB via provided URL (parsing failed)");
}

let sequelize;

if (DATABASE_URL) {
    sequelize = new Sequelize(DATABASE_URL, {
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Required for Neon and Render
            }
        }
    });
} else {
    // Create a dummy instance to avoid import errors, but it will fail on use
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
    console.warn("❌ SEQUELIZE ERROR: No DATABASE_URL provided. Using in-memory fallback (will fail for real ops).");
}


const connectDB = async () => {
    try {
        if (!DATABASE_URL) {
            console.warn("⚠️  DATABASE_URL is not defined in environment variables!");
            return;
        }

        let maskedUrl = DATABASE_URL;
        try {
            const url = new URL(DATABASE_URL);
            maskedUrl = `${url.protocol}//${url.username}:****@${url.hostname}${url.pathname}${url.search}`;
            console.log(`📡 Connecting to: ${url.hostname}`);
        } catch (e) {
            console.log("📡 Connecting to database (URL parsing skipped)");
        }

        console.log("Attempting to connect to PostgreSQL...");
        await sequelize.authenticate();
        console.log("✅ DATABASE CONNECTION SUCCESS: Successfully connected to PostgreSQL.");

        // Sync models
        await sequelize.sync({ alter: true });
        console.log("✅ DATABASE SYNC SUCCESS: All models synchronized.");
    } catch (error) {
        console.error("❌ DATABASE CONNECTION FAILURE:");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.original) {
            console.error("Original Error:", error.original.message);
        }
        // Don't exit here, let the server run so we can see health checks
        console.log("⚠️  Continuing server execution without database connection...");
    }
}

export { sequelize, connectDB };