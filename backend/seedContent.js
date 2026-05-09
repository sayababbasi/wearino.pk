import { connectDB } from "./config/db.js";
import Content from "./models/Content.js";
import dotenv from "dotenv";

dotenv.config();

const seedContent = async () => {
    try {
        await connectDB();

        console.log("Clearing existing content...");
        await Content.destroy({ where: {}, truncate: true });

        console.log("Seeding content...");
        const contentData = [
            // Hero Banners
            {
                type: 'banner',
                title: 'New Season Arrivals',
                // Use external URL for stability if local not uploaded, or assume logic handles it. 
                // Ideally we download these to uploads/ but for seed we use external URLs as fallback
                // or we point to what was in mock data.
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
                linkUrl: '/categories/women',
                position: 'hero',
                order: 2,
                isActive: true,
                meta: { subtitle: 'Fresh styles for sunny days', buttonText: 'Explore' }
            },

            // Secondary Banner (Trending)
            {
                type: 'banner',
                title: 'Trending Now',
                imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200',
                linkUrl: '/products',
                position: 'secondary',
                order: 1,
                isActive: true,
                meta: { subtitle: "Discover what everyone's talking about", buttonText: 'Explore Collection' }
            },

            // Promotional Banner (Free Shipping)
            {
                type: 'banner',
                title: 'Free Shipping',
                imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',
                linkUrl: '/products',
                position: 'promotional',
                order: 1,
                isActive: true,
                meta: { subtitle: 'On all orders over $75', buttonText: 'Shop Now' }
            },

            // Announcement Bar
            {
                type: 'announcement',
                title: 'Free Shipping On Orders Over Rs 75!',
                isActive: true,
                meta: { backgroundColor: '#000000', textColor: '#ffffff' }
            }
        ];

        await Content.bulkCreate(contentData);
        console.log("Content seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding content:", error);
        process.exit(1);
    }
};

seedContent();
