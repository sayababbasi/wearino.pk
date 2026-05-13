import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("CRITICAL ERROR: DATABASE_URL environment variable is not set!");
    process.exit(1);
}

const sequelize = new Sequelize(DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Required for Neon and Render
        }
    }
});


const connectDB = async () => {
    try {
        console.log("Attempting to connect to PostgreSQL at Neon...");
        await sequelize.authenticate();
        console.log("✅ DATABASE CONNECTION SUCCESS: Successfully connected to Neon PostgreSQL.");

        // Force conversion of contents.type from ENUM to VARCHAR if needed
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
            console.log("ℹ️ Optional migration skipped: contents table handled.");
        }

        await sequelize.sync({ alter: true });
        
        // Manual safety check for critical columns (Sequelize alter can sometimes fail silently)
        try {
            await sequelize.query(`
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='rejection_reason') THEN
                        ALTER TABLE "orders" ADD COLUMN "rejection_reason" TEXT;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_proof_image') THEN
                        ALTER TABLE "orders" ADD COLUMN "payment_proof_image" VARCHAR(255);
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='tax_percentage') THEN
                        ALTER TABLE "orders" ADD COLUMN "tax_percentage" NUMERIC(5,2) DEFAULT 0;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_charges') THEN
                        ALTER TABLE "orders" ADD COLUMN "delivery_charges" NUMERIC(10,2) DEFAULT 0;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='coupon_discount') THEN
                        ALTER TABLE "orders" ADD COLUMN "coupon_discount" NUMERIC(10,2) DEFAULT 0;
                    END IF;
                END $$;
            `);
        } catch (e) {
            console.log("ℹ️ Manual migration check handled.");
        }

        console.log("✅ DATABASE SYNC SUCCESS: All models synchronized.");
    } catch (error) {
        console.error("❌ DATABASE CONNECTION FAILURE:");
        console.error("Reason:", error.message);
        if (error.original) {
            console.error("Original Error:", error.original.message);
        }
        process.exit(1); // Exit if DB connection fails in production
    }
}

export { sequelize, connectDB };