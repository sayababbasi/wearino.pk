/**
 * Fix Inquiry Table Schema
 * 
 * Manually alters the database table to make productId nullable
 * and add subject column if it doesn't exist.
 */

import { sequelize } from "./config/db.js";
import { QueryTypes } from "sequelize";

async function fixSchema() {
  try {
    console.log("🔄 Fixing Inquiry table schema...");
    
    await sequelize.authenticate();
    console.log("✅ Database connected");
    
    // Check if subject column exists
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Inquiries' AND column_name = 'subject'
    `);
    
    // Add subject column if it doesn't exist
    if (columns.length === 0) {
      await sequelize.query(`
        ALTER TABLE "Inquiries" 
        ADD COLUMN "subject" VARCHAR(255)
      `);
      console.log("✅ Added 'subject' column");
    } else {
      console.log("✅ 'subject' column already exists");
    }
    
    // Make productId nullable
    await sequelize.query(`
      ALTER TABLE "Inquiries" 
      ALTER COLUMN "productId" DROP NOT NULL
    `);
    console.log("✅ Made 'productId' nullable");
    
    // Verify
    const [tableInfo] = await sequelize.query(`
      SELECT 
        column_name, 
        is_nullable,
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'Inquiries'
      AND column_name IN ('productId', 'subject')
      ORDER BY column_name
    `);
    
    console.log("\n📋 Updated table structure:");
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.is_nullable === 'YES' ? 'NULLABLE ✓' : 'NOT NULL'}`);
    });
    
    console.log("\n✅ Schema fix completed!");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    await sequelize.close();
    process.exit(1);
  }
}

fixSchema();

