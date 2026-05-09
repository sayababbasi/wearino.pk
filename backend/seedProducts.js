import { sequelize } from "./config/db.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import dotenv from "dotenv";

dotenv.config();

// Sample product data with tags
const sampleProducts = [
  // Sale Products
  {
    name: "Classic White Tee - Sale",
    description: "A timeless classic white tee made from premium cotton. Perfect for everyday wear and easy to style with any outfit.",
    price: 19.99,
    stock: 50,
    tags: ["Sale"],
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Tops"
  },
  {
    name: "Denim Jacket - Sale",
    description: "Classic denim jacket with a modern fit. Features button closure and multiple pockets for a stylish look.",
    price: 49.99,
    stock: 30,
    tags: ["Sale"],
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Jackets"
  },
  {
    name: "Summer Dress - Sale",
    description: "Lightweight summer dress perfect for warm weather. Flowy design with elegant patterns for a feminine look.",
    price: 39.99,
    stock: 25,
    tags: ["Sale"],
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Dresses"
  },

  // New Arrivals
  {
    name: "Leather Boots - New",
    description: "Premium leather boots with cushioned insole. Durable and stylish for any occasion, perfect for all seasons.",
    price: 89.99,
    stock: 40,
    tags: ["New"],
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Accessories"
  },
  {
    name: "Casual Shirt - New",
    description: "Comfortable casual shirt made from breathable fabric. Perfect for casual outings and everyday comfort.",
    price: 34.99,
    stock: 45,
    tags: ["New"],
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=600&fit=crop"],
    department: "Men",
    categoryName: "Tops"
  },
  {
    name: "Fashion Blouse - New",
    description: "Elegant blouse with modern design. Versatile piece that can be dressed up or down for any occasion.",
    price: 44.99,
    stock: 35,
    tags: ["New"],
    images: ["https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Tops"
  },

  // Trending Products
  {
    name: "Stylish Top - Trending",
    description: "Trendy top with contemporary style. Made from high-quality materials for comfort and durability.",
    price: 29.99,
    stock: 60,
    tags: ["Trending"],
    images: ["https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Tops"
  },
  {
    name: "Fashionable Outfit - Trending",
    description: "Complete fashionable outfit set. Perfect combination of style and comfort for the modern wardrobe.",
    price: 79.99,
    stock: 20,
    tags: ["Trending"],
    images: ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Dresses"
  },
  {
    name: "Layering Cardigan - Trending",
    description: "Versatile cardigan perfect for layering. Soft and cozy, ideal for transitional weather.",
    price: 54.99,
    stock: 40,
    tags: ["Trending"],
    images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Jackets"
  },

  // Regular Products
  {
    name: "Designer Blazer",
    description: "Professional blazer with tailored fit. Perfect for business casual or formal occasions.",
    price: 99.99,
    stock: 30,
    tags: [],
    images: ["https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Jackets"
  },
  {
    name: "Casual Pants",
    description: "Comfortable casual pants with modern fit. Perfect for everyday wear with any style.",
    price: 39.99,
    stock: 50,
    tags: [],
    images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=600&fit=crop"],
    department: "Men",
    categoryName: "Bottoms"
  },
  {
    name: "Elegant Dress",
    description: "Elegant dress with sophisticated design. Perfect for special occasions and evening events.",
    price: 89.99,
    stock: 25,
    tags: [],
    images: ["https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Dresses"
  },
  {
    name: "Branded T-Shirt",
    description: "Premium branded t-shirt with quality fabric. Comfortable fit with stylish design elements.",
    price: 24.99,
    stock: 70,
    tags: [],
    images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=600&fit=crop"],
    department: "Men",
    categoryName: "Tops"
  },
  {
    name: "Fashion Accessory",
    description: "Stylish fashion accessory to complete your look. High-quality materials and contemporary design.",
    price: 19.99,
    stock: 100,
    tags: [],
    images: ["https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=600&fit=crop"],
    department: "Women",
    categoryName: "Accessories"
  },
];

const seedProducts = async () => {
  try {
    // Connect to database
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection established.");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError.message);
      console.log("\n💡 Database Setup Required:");
      console.log("   1. Make sure PostgreSQL is running");
      console.log("   2. Create the database:");
      console.log("      createdb <database_name>");
      console.log("   3. Or update .env with correct DB credentials");
      console.log("\n   The frontend works with mock data, so database is optional.");
      console.log("   Products can be added via Admin Dashboard once backend is running.\n");
      process.exit(1);
    }

    // Sync models (creates tables if they don't exist)
    // FORCE: true because we changed schema (image -> images)
    await sequelize.sync({ force: true });
    console.log("✅ Database models synced.");

    // Get or create categories
    const categories = {};
    const categoryNames = ["Tops", "Bottoms", "Dresses", "Jackets", "Accessories", "Women", "Men", "Kids", "Beauty"];

    // Create unique categories by name only (no department field)
    for (const catName of categoryNames) {
      const [category] = await Category.findOrCreate({
        where: { name: catName },
        defaults: { name: catName }
      });
      categories[catName] = category;
    }

    console.log("✅ Categories ready.");

    // Clear existing products (optional - comment out if you want to keep existing)
    // await Product.destroy({ where: {} });
    // console.log("✅ Existing products cleared.");

    // Create products
    let created = 0;
    let skipped = 0;

    for (const productData of sampleProducts) {
      try {
        // Find category by name only (no department in Category model)
        const category = categories[productData.categoryName];

        if (!category) {
          console.log(`⚠️  Category not found: ${productData.categoryName}, skipping product: ${productData.name}`);
          skipped++;
          continue;
        }

        // Check if product already exists
        const existing = await Product.findOne({ where: { name: productData.name } });
        if (existing) {
          console.log(`⏭️  Product already exists: ${productData.name}`);
          skipped++;
          continue;
        }

        // Create product
        await Product.create({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          stock: productData.stock,
          tags: productData.tags,
          images: productData.images || [], // Use images array directly
          categoryId: category.id,
        });

        created++;
        console.log(`✅ Created: ${productData.name}`);
      } catch (error) {
        console.error(`❌ Error creating ${productData.name}:`, error.message);
        skipped++;
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log(`   ✅ Created: ${created} products`);
    console.log(`   ⏭️  Skipped: ${skipped} products`);
    console.log("\n🎉 Seeding completed!");

  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
};

// Run seed
seedProducts();

