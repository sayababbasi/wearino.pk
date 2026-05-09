/**
 * Migration Script: Update Inquiry Model Schema
 * 
 * This script updates the Inquiry table to:
 * 1. Make productId nullable (for general contact inquiries)
 * 2. Add subject field (for contact form)
 * 
 * Run this once to update the database schema.
 */

import { sequelize } from "./config/db.js";
import Inquiry from "./models/Inquiry.js";

async function migrate() {
  try {
    console.log("🔄 Starting Inquiry model migration...");
    
    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected");
    
    // Sync model with alter: true to update schema
    await Inquiry.sync({ alter: true });
    console.log("✅ Inquiry model schema updated");
    
    // Verify the change
    const tableInfo = await sequelize.getQueryInterface().describeTable("Inquiries");
    console.log("\n📋 Inquiry table structure:");
    console.log("  - productId:", tableInfo.productId?.allowNull ? "NULLABLE ✓" : "NOT NULL ✗");
    console.log("  - subject:", tableInfo.subject ? "EXISTS ✓" : "MISSING ✗");
    
    console.log("\n✅ Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();

