
import { connectDB } from "./config/db.js";
import Content from "./models/Content.js";
import Product from "./models/Product.js";
import dotenv from "dotenv";

dotenv.config();

const seedAllContent = async () => {
    try {
        await connectDB();

        console.log("Clearing existing content...");
        await Content.destroy({ where: {}, truncate: true });

        console.log("Fetching some products for featured content...");
        const products = await Product.findAll({ limit: 5 });

        console.log("Seeding all content types...");
        const contentData = [
            // Hero Banners
            {
                type: 'banner',
                title: 'New Season Arrivals',
                imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200',
                linkUrl: '/products',
                position: 'hero',
                order: 1,
                isActive: true,
                meta: { subtitle: 'Shop the latest trends', buttonText: 'Shop Now' }
            },
            {
                type: 'banner',
                title: 'Summer Collection',
                imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200',
                linkUrl: '/products',
                position: 'hero',
                order: 2,
                isActive: true,
                meta: { subtitle: 'Fresh styles for sunny days', buttonText: 'Explore' }
            },

            // Category Features
            {
                type: 'category_feature',
                title: 'FREE SHIPPING',
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/709/709790.png',
                linkUrl: '#',
                order: 1,
                isActive: true,
                meta: { subtitle: 'On all orders over Rs. 2000' }
            },
            {
                type: 'category_feature',
                title: 'EASY RETURNS',
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/1585/1585141.png',
                linkUrl: '#',
                order: 2,
                isActive: true,
                meta: { subtitle: '7 days return policy' }
            },
            {
                type: 'category_feature',
                title: 'SECURE PAYMENT',
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/1160/1160285.png',
                linkUrl: '#',
                order: 3,
                isActive: true,
                meta: { subtitle: '100% secure payment' }
            },
            {
                type: 'category_feature',
                title: '24/7 SUPPORT',
                imageUrl: 'https://cdn-icons-png.flaticon.com/512/1067/1067566.png',
                linkUrl: '#',
                order: 4,
                isActive: true,
                meta: { subtitle: 'Dedicated support team' }
            },

            // Influencers
            {
                type: 'influencer',
                title: 'AYESHA KHAN',
                imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                isActive: true,
                order: 1
            },
            {
                type: 'influencer',
                title: 'SARA MALIK',
                imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
                isActive: true,
                order: 2
            },
            {
                type: 'influencer',
                title: 'ZAINAB AHMED',
                imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
                isActive: true,
                order: 3
            },

            // Announcement Bar
            {
                type: 'announcement',
                title: 'FREE SHIPPING ON ALL ORDERS OVER RS 2000! SHOP NOW',
                isActive: true,
                meta: { backgroundColor: '#000000', textColor: '#ffffff' }
            }
        ];

        // Add featured products if available
        if (products.length > 0) {
            contentData.push({
                type: 'featured_product',
                title: 'Product of the Week',
                productId: products[0].id,
                isActive: true,
                order: 1
            });
        }

        await Content.bulkCreate(contentData);
        console.log("✅ All content types seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding all content:", error);
        process.exit(1);
    }
};

seedAllContent();
