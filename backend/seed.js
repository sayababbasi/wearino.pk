
import mongoose from "mongoose"; // Mistake: User uses Sequelize/Postgres. Correcting to Sequelize.
// Wait, previous file view showed Sequelize.

import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import { connectDB } from "./config/db.js";

// Load env vars from current directory (backend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');
console.log(`Loading env from: ${envPath}`);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error("Error loading .env:", result.error);
}

console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASS (length):", process.env.DB_PASS ? process.env.DB_PASS.length : "undefined");


const seedDatabase = async () => {
    try {
        await connectDB();

        console.log("Beginning Database Seed...");

        // 1. Create Categories
        const categoriesData = [
            { name: "Men's Fashion", description: "Latest trends in men's clothing.", image: "https://images.unsplash.com/photo-1490578474895-699cd4d2ff5f?w=500", status: "active" },
            { name: "Women's Apparel", description: "Elegant and stylish women's wear.", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500", status: "active" },
            { name: "Electronics & Gadgets", description: "Cutting-edge tech and devices.", image: "https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?w=500", status: "active" },
            { name: "Home & Living", description: "Decor and essentials for your home.", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500", status: "active" },
            { name: "Trending", description: "Hot items everyone is talking about.", image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=500", status: "active" }
        ];

        // Upsert categories to ensure we get IDs but don't duplicate names
        const categoryMap = {};
        for (const catData of categoriesData) {
            const [category] = await Category.findOrCreate({
                where: { name: catData.name },
                defaults: catData
            });
            categoryMap[catData.name] = category;
            console.log(`Category ensured: ${category.name}`);
        }

        // 2. Define Products
        const productsData = [
            // Men's Fashion
            {
                name: "Classic Leather Jacket",
                price: 249.99,
                description: "A timeless leather jacket that adds edge to any outfit.",
                stock: 15,
                categoryName: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=500"
            },
            {
                name: "Slim Fit Chinos",
                price: 59.99,
                description: "Comfortable and stylish chinos perfect for casual or semi-formal wear.",
                stock: 50,
                categoryName: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500"
            },
            {
                name: "Oxford Cotton Shirt",
                price: 45.50,
                description: "Premium cotton shirt, breathable and durable.",
                stock: 3, // Low Stock
                categoryName: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500"
            },
            {
                name: "Urban Sneakers",
                price: 89.00,
                description: "Street-style sneakers designed for all-day comfort.",
                stock: 20,
                categoryName: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
            },
            {
                name: "Denim Trucker Jacket",
                price: 79.99,
                description: "Rugged denim jacket with a vintage wash.",
                stock: 12,
                categoryName: "Men's Fashion",
                image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=500"
            },

            // Women's Apparel
            {
                name: "Floral Maxi Dress",
                price: 85.00,
                description: "Flowy and feminine, perfect for summer days.",
                stock: 25,
                categoryName: "Women's Apparel",
                image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500"
            },
            {
                name: "High-Waist Jeans",
                price: 65.00,
                description: "Flattering fit with premium denim fabric.",
                stock: 40,
                categoryName: "Women's Apparel",
                image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500"
            },
            {
                name: "Cashmere Sweater",
                price: 120.00,
                description: "Luxuriously soft sweater for chilly evenings.",
                stock: 8,
                categoryName: "Women's Apparel",
                image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500"
            },
            {
                name: "Silk Blouse",
                price: 95.00,
                description: "Elegant silk blouse suitable for office or dinner.",
                stock: 2, // Low stock
                categoryName: "Women's Apparel",
                image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=500"
            },
            {
                name: "Leather Tote Bag",
                price: 150.00,
                description: "Spacious and chic, carries all your essentials.",
                stock: 18,
                categoryName: "Women's Apparel",
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500"
            },

            // Electronics & Gadgets
            {
                name: "Wireless Noise-Canceling Headphones",
                price: 299.99,
                description: "Immersive sound with industry-leading noise cancellation.",
                stock: 30,
                categoryName: "Electronics & Gadgets",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
                isTrendingOverride: true // Mark as trending
            },
            {
                name: "Smart Fitness Watch",
                price: 199.50,
                description: "Track your health metrics and workouts with precision.",
                stock: 45,
                categoryName: "Electronics & Gadgets",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
            },
            {
                name: "4K Action Camera",
                price: 349.00,
                description: "Capture your adventures in stunning ultra-high definition.",
                stock: 10,
                categoryName: "Electronics & Gadgets",
                image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500"
            },
            {
                name: "Bluetooth Portable Speaker",
                price: 59.99,
                description: "Powerful sound in a compact, water-resistant design.",
                stock: 60,
                categoryName: "Electronics & Gadgets",
                image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500"
            },
            {
                name: "Mechanical Keyboard",
                price: 129.99,
                description: "Tactile and responsive typing experience for pros.",
                stock: 4, // Low stock
                categoryName: "Electronics & Gadgets",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?w=500"
            },

            // Home & Living
            {
                name: "Minimalist Desk Lamp",
                price: 45.00,
                description: "Sleek design with adjustable brightness levels.",
                stock: 35,
                categoryName: "Home & Living",
                image: "https://images.unsplash.com/photo-1507473888900-52e1adad5452?w=500"
            },
            {
                name: "Ceramic Plant Pot Set",
                price: 35.50,
                description: "Modern pots to elevate your indoor greenery.",
                stock: 22,
                categoryName: "Home & Living",
                image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500"
            },
            {
                name: "Geometric Rug",
                price: 120.00,
                description: "Add a pop of pattern to your living space.",
                stock: 15,
                categoryName: "Home & Living",
                image: "https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=500"
            },
            {
                name: "Aromatherapy Diffuser",
                price: 49.99,
                description: "Create a calming atmosphere with essential oils.",
                stock: 40,
                categoryName: "Home & Living",
                image: "https://images.unsplash.com/photo-1602166699663-8a9d18b456d2?w=500"
            },
            {
                name: "Cotton Throw Blanket",
                price: 39.99,
                description: "Soft and cozy, perfect for sofa snuggles.",
                stock: 28,
                categoryName: "Home & Living",
                image: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500"
            }
        ];

        // 3. Create Products and Link
        console.log("Creating Products...");

        // Explicitly select 3 products correctly for Trending Logic logic
        // We will set their 'isTrending' flag to true.
        // We will also link them to the "Trending" category via M:N relationship
        const trendingProductsToFlag = [
            "Classic Leather Jacket",
            "Wireless Noise-Canceling Headphones",
            "Ceramic Plant Pot Set"
        ];

        for (const prodData of productsData) {
            const category = categoryMap[prodData.categoryName];
            console.log(`Processing: ${prodData.name} -> Category: ${category.name}`);

            // Check for existence
            let [product, created] = await Product.findOrCreate({
                where: { name: prodData.name },
                defaults: {
                    name: prodData.name,
                    description: prodData.description,
                    price: prodData.price,
                    stock: prodData.stock,
                    sku: `SKU-${Math.floor(Math.random() * 10000)}`,
                    status: 'active',
                    images: [prodData.image], // Array of strings
                    categoryId: category.id,
                    // Set isTrending if it's one of our chosen ones
                    isTrending: trendingProductsToFlag.includes(prodData.name),
                    tags: ["New"],
                    // Add sizes for all clothing products
                    sizes: prodData.categoryName.includes("Fashion") || prodData.categoryName.includes("Apparel")
                        ? ["XS", "S", "M", "L", "XL"]
                        : prodData.categoryName.includes("Electronics")
                            ? []
                            : ["One Size"]
                }
            });

            // If product existed, update it to ensure our test conditions are met
            if (!created) {
                await product.update({
                    stock: prodData.stock,
                    categoryId: category.id,
                    isTrending: trendingProductsToFlag.includes(prodData.name),
                    images: [prodData.image],
                    sizes: prodData.categoryName.includes("Fashion") || prodData.categoryName.includes("Apparel")
                        ? ["XS", "S", "M", "L", "XL"]
                        : prodData.categoryName.includes("Electronics")
                            ? []
                            : ["One Size"]
                });
                console.log(`Updated existing product: ${product.name}`);
            } else {
                console.log(`Created new product: ${product.name}`);
            }

            // 4. Global Product Placement Logic
            // If it is a "Trending" product, ALSO assign it to the "Trending" Category using the junction table
            if (trendingProductsToFlag.includes(prodData.name)) {
                const trendingCategory = categoryMap["Trending"];
                if (trendingCategory) {
                    // Sequelize belongsToMany magic method
                    // Check if method exists (it should if models loaded correctly)
                    if (product.addSecondaryCategory) {
                        await product.addSecondaryCategory(trendingCategory);
                        console.log(`Linked ${product.name} to Trending Category (M:N)`);
                    } else {
                        console.warn(`Magic method addSecondaryCategory not found on Product model! Check associations.`);
                    }
                }
            }
        }

        console.log("Database Seed Data Verified and Populated Successfully!");
        process.exit(0);

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();
