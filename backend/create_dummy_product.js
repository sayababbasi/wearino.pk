import { sequelize } from "./config/db.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import dotenv from "dotenv";

dotenv.config();

const createDummyProduct = async () => {
  try {
    // Connect to database
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established.");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError.message);
      process.exit(1);
    }

    // Find category
    const category = await Category.findOne({ where: { name: "Accessories" } });
    if (!category) {
      console.error("❌ 'Accessories' category not found. Run seed script first.");
      process.exit(1);
    }

    // Dummy product data
    const dummyProduct = {
      name: "Dummy Product 123",
      description: "This is a dummy product for testing purposes.",
      price: 9.99,
      stock: 100,
      tags: ["Dummy", "Test"],
      image: "https://via.placeholder.com/400x600?text=Dummy+Product",
      categoryId: category.id,
    };

    // Check if exists
    const existing = await Product.findOne({ where: { name: dummyProduct.name } });
    if (existing) {
      console.log(`⚠️  Product '${dummyProduct.name}' already exists.`);
    } else {
      await Product.create(dummyProduct);
      console.log(`✅ Created: ${dummyProduct.name}`);
    }

  } catch (error) {
    console.error("❌ Error creating dummy product:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

createDummyProduct();
