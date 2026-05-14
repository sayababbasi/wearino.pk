import { sequelize } from "./config/db.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import Content from "./models/Content.js";
import dotenv from "dotenv";

dotenv.config();

const categoriesData = [
  { name: "Men's Apparel", description: "Sharp and casual clothing for men", image: "https://images.unsplash.com/photo-1490578474895-699cd4d2ff5f?w=800&q=80" },
  { name: "Women's Collection", description: "Elegant and modern styles for women", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80" },
  { name: "Luxury Accessories", description: "Watches, sunglasses, and more", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80" },
  { name: "Footwear", description: "Step out in style with our premium shoes", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" },
  { name: "Kids' Corner", description: "Cute and comfortable clothes for children", image: "https://images.unsplash.com/photo-1519704943920-1844582b7bac?w=800&q=80" },
  { name: "Home & Lifestyle", description: "Decor and essentials for your living space", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80" }
];

const productsData = [
  // --- NEW ARRIVALS (Tag: 'new_arrivals') ---
  {
    name: "Oversized Wool Blend Coat",
    price: 12500,
    description: "Elegant wool blend coat with a relaxed fit, perfect for layering.",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80"],
    tags: ["new_arrivals", "trending"],
    sizes: ["S", "M", "L"],
    categoryName: "Women's Collection"
  },
  {
    name: "Knitted Polo Sweater",
    price: 4200,
    description: "Premium knitted polo with a soft touch and classic collar.",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&q=80"],
    tags: ["new_arrivals"],
    sizes: ["M", "L", "XL"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Leather Crossbody Bag",
    price: 6800,
    description: "Handcrafted leather bag with adjustable strap and gold hardware.",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"],
    tags: ["new_arrivals", "luxury"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
  },
  {
    name: "High-Top Suede Sneakers",
    price: 8500,
    description: "Stylish high-top sneakers in premium charcoal suede.",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=80"],
    tags: ["new_arrivals", "trending"],
    sizes: ["40", "41", "42", "43", "44"],
    categoryName: "Footwear"
  },
  {
    name: "Linen Wide-Leg Trousers",
    price: 3800,
    description: "Breathable linen trousers with a flattering wide-leg silhouette.",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"],
    tags: ["new_arrivals"],
    sizes: ["26", "28", "30", "32"],
    categoryName: "Women's Collection"
  },
  {
    name: "Minimalist Trench Coat",
    price: 9800,
    description: "A timeless trench coat with clean lines and water-resistant finish.",
    stock: 12,
    images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"],
    tags: ["new_arrivals", "essential"],
    sizes: ["S", "M", "L"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Classic Leather Loafers",
    price: 11500,
    description: "Hand-stitched leather loafers with a comfortable cushioned sole.",
    stock: 18,
    images: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80"],
    tags: ["new_arrivals"],
    sizes: ["40", "41", "42", "43", "44"],
    categoryName: "Footwear"
  },
  {
    name: "Silk Emerald Slip Dress",
    price: 6500,
    description: "Elegant emerald green silk dress for evening wear.",
    stock: 14,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"],
    tags: ["new_arrivals", "trending"],
    sizes: ["XS", "S", "M"],
    categoryName: "Women's Collection"
  },

  // --- FLASH SALE (Tag: 'sale') ---
  {
    name: "Midnight Silk Wrap Dress",
    price: 7500,
    discount: 40,
    description: "Luxurious silk wrap dress in a deep midnight blue.",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80"],
    tags: ["sale", "trending"],
    sizes: ["S", "M", "L"],
    categoryName: "Women's Collection"
  },
  {
    name: "Canvas Weekender Bag",
    price: 5200,
    discount: 20,
    description: "Durable canvas bag with leather trim, perfect for short trips.",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1544816153-199d88b713c0?w=800&q=80"],
    tags: ["sale"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
  },
  {
    name: "Cotton Cargo Pants",
    price: 3200,
    discount: 30,
    description: "Relaxed fit cargo pants in premium cotton twill.",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80"],
    tags: ["sale"],
    sizes: ["30", "32", "34", "36"],
    categoryName: "Men's Apparel"
  },

  // --- TRENDING (Tag: 'trending') ---
  {
    name: "Vintage Aviator Jacket",
    price: 15500,
    description: "Sherpa-lined aviator jacket with a distressed leather finish.",
    stock: 8,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    tags: ["trending", "luxury"],
    sizes: ["M", "L", "XL"],
    categoryName: "Men's Apparel"
  }
];

const contentData = [
  // HERO BANNERS
  {
    type: 'banner',
    title: 'THE WEARINO PRECISION',
    imageUrl: 'https://wearino-pk.vercel.app/images/hero/banner-1.jpg',
    linkUrl: '/products?category=Accessories',
    position: 'hero',
    order: 1,
    isActive: true,
    meta: { subtitle: 'Elite Tech & Lifestyle Collection', buttonText: 'Shop Now' }
  },
  {
    type: 'banner',
    title: 'TIMELESS LUXURY',
    imageUrl: 'https://wearino-pk.vercel.app/images/hero/banner-2.jpg',
    linkUrl: '/products?category=Accessories',
    position: 'hero',
    order: 2,
    isActive: true,
    meta: { subtitle: 'Curated Essentials for the Modern Individual', buttonText: 'Explore' }
  },

  // CATEGORY FEATURES (The Highlights Bar)
  {
    type: 'category_feature',
    title: 'FAST DELIVERY',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/709/709790.png',
    linkUrl: '#',
    order: 1,
    isActive: true,
    meta: { subtitle: 'Delivery within 2-3 business days' }
  },
  {
    type: 'category_feature',
    title: '7-DAY RETURNS',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1585/1585141.png',
    linkUrl: '#',
    order: 2,
    isActive: true,
    meta: { subtitle: 'Hassle-free exchange policy' }
  },
  {
    type: 'category_feature',
    title: 'SECURE PAYMENT',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1160/1160285.png',
    linkUrl: '#',
    order: 3,
    isActive: true,
    meta: { subtitle: '100% encrypted transactions' }
  },
  {
    type: 'category_feature',
    title: '24/7 SUPPORT',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1067/1067566.png',
    linkUrl: '#',
    order: 4,
    isActive: true,
    meta: { subtitle: 'Always here to help you' }
  },

  // ANNOUNCEMENT
  {
    type: 'announcement',
    title: '🔥 FLASH SALE: UP TO 50% OFF! LIMITED TIME ONLY 🔥',
    isActive: true,
    meta: { backgroundColor: '#000000', textColor: '#ffffff' }
  }
];

const reseedEverything = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to Neon DB...");

    // 1. Wipe everything
    console.log("Wiping all data...");
    await Product.destroy({ where: {}, cascade: true });
    await Category.destroy({ where: {}, cascade: true });
    await Content.destroy({ where: {}, cascade: true });

    // 2. Insert Categories
    const catMap = {};
    for (const cat of categoriesData) {
      const created = await Category.create({ ...cat, status: 'active' });
      catMap[cat.name] = created.id;
      console.log(`Created Category: ${cat.name}`);
    }

    // 3. Insert Products
    for (const prod of productsData) {
      await Product.create({
        ...prod,
        categoryId: catMap[prod.categoryName],
        sku: `WRN-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'active',
        isTrending: prod.tags.includes("trending")
      });
      console.log(`  Added Product: ${prod.name}`);
    }

    // 4. Insert Content
    await Content.bulkCreate(contentData);
    console.log("✅ CONTENT SEEDED SUCCESSFULLY!");

    console.log(`✅ ALL SITE SECTIONS POPULATED!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Reseed failed:", error);
    process.exit(1);
  }
};

reseedEverything();
