import { sequelize } from "./config/db.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import dotenv from "dotenv";

dotenv.config();

const fashionData = [
  {
    category: { name: "Women's Collection", description: "Elegant and modern styles for women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" },
    products: [
      {
        name: "Floral Summer Maxi Dress",
        price: 3499,
        description: "A beautiful, breathable floral dress perfect for summer outings and beach days.",
        stock: 45,
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"],
        tags: ["Best Seller", "New"],
        sizes: ["S", "M", "L", "XL"]
      },
      {
        name: "Classic Silk Blouse",
        price: 2800,
        description: "Elegant silk blouse in pearl white, suitable for both office and evening wear.",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80"],
        tags: ["Premium"],
        sizes: ["XS", "S", "M", "L"]
      },
      {
        name: "High-Waist Designer Jeans",
        price: 4200,
        description: "Premium denim with a flattering high-waist fit and distressed detailing.",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80"],
        tags: ["Trending"],
        sizes: ["26", "28", "30", "32"]
      }
    ]
  },
  {
    category: { name: "Men's Wear", description: "Sharp and casual clothing for the modern man", image: "https://images.unsplash.com/photo-1490578474895-699cd4d2ff5f?w=800&q=80" },
    products: [
      {
        name: "Premium Cotton Oxford Shirt",
        price: 2500,
        description: "A versatile cotton shirt with a crisp finish and comfortable fit.",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"],
        tags: ["Essential"],
        sizes: ["M", "L", "XL", "XXL"]
      },
      {
        name: "Urban Leather Jacket",
        price: 8500,
        description: "Genuine leather jacket with minimalist silver hardware for a rugged look.",
        stock: 12,
        images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
        tags: ["Winter", "Luxury"],
        sizes: ["M", "L", "XL"]
      },
      {
        name: "Slim Fit Cargo Pants",
        price: 3200,
        description: "Durable cotton cargo pants with multiple utility pockets and slim silhouette.",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"],
        tags: ["New"],
        sizes: ["30", "32", "34", "36"]
      }
    ]
  },
  {
    category: { name: "Luxury Accessories", description: "The finishing touches to your perfect look", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
    products: [
      {
        name: "Midnight Chronograph Watch",
        price: 12500,
        description: "Sleek black watch with leather strap and precise Japanese movement.",
        stock: 10,
        images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
        tags: ["Exclusive"],
        sizes: ["One Size"]
      },
      {
        name: "Aviator Gold Sunglasses",
        price: 1800,
        description: "Classic aviator style with polarized lenses and 18k gold-toned frames.",
        stock: 35,
        images: ["https://images.unsplash.com/photo-1511499767390-90342f16b147?w=800&q=80"],
        tags: ["Summer"],
        sizes: ["One Size"]
      }
    ]
  }
];

const reseed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to Neon DB...");

    // 1. Wipe existing data
    console.log("Wiping existing categories and products...");
    // Force delete to ignore constraints if any, or just use destroy
    await Product.destroy({ where: {}, truncate: false, cascade: true });
    await Category.destroy({ where: {}, truncate: false, cascade: true });

    // 2. Insert new data
    for (const item of fashionData) {
      const category = await Category.create({
        ...item.category,
        status: 'active'
      });
      console.log(`Created Category: ${category.name}`);

      for (const prod of item.products) {
        await Product.create({
          ...prod,
          categoryId: category.id,
          sku: `WRN-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'active',
          isTrending: prod.tags.includes("Trending") || prod.tags.includes("Best Seller")
        });
        console.log(`  Added Product: ${prod.name}`);
      }
    }

    console.log("✅ STORE RESEEDED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Reseed failed:", error);
    process.exit(1);
  }
};

reseed();
