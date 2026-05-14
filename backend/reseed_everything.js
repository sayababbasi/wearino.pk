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
  // --- FLASH SALE (Tag: 'sale') ---
  {
    name: "Red Velvet Party Dress",
    price: 4500,
    discount: 25,
    description: "Stunning red velvet dress for special occasions.",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"],
    tags: ["sale", "trending"],
    sizes: ["S", "M", "L"],
    categoryName: "Women's Collection"
  },
  {
    name: "Summer Linen Shirt",
    price: 1800,
    discount: 15,
    description: "Lightweight linen shirt for hot summer days.",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"],
    tags: ["sale"],
    sizes: ["M", "L", "XL"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Glitter Sparkle Flats",
    price: 2200,
    discount: 30,
    description: "Comfortable flats with a touch of sparkle.",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80"],
    tags: ["sale", "kids"],
    sizes: ["28", "30", "32"],
    categoryName: "Kids' Corner"
  },
  {
    name: "Crystal Scented Candle",
    price: 1200,
    discount: 20,
    description: "Beautifully scented candle with hidden crystals.",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800&q=80"],
    tags: ["sale"],
    sizes: ["One Size"],
    categoryName: "Home & Lifestyle"
  },

  // --- NEW ARRIVALS (Tag: 'new_arrivals') ---
  {
    name: "Modern Art Print Tee",
    price: 1500,
    description: "Heavyweight cotton tee with a unique modern art print.",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"],
    tags: ["new_arrivals"],
    sizes: ["S", "M", "L", "XL"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Silk Emerald Slip Dress",
    price: 5800,
    description: "Pure silk slip dress in a vibrant emerald green.",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80"],
    tags: ["new_arrivals", "trending"],
    sizes: ["S", "M"],
    categoryName: "Women's Collection"
  },
  {
    name: "Tech-Mesh Sport Shoes",
    price: 7200,
    description: "Advanced running shoes with breathable tech-mesh.",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80"],
    tags: ["new_arrivals"],
    sizes: ["40", "41", "42", "43"],
    categoryName: "Footwear"
  },

  // --- TRENDING (Tag: 'trending') ---
  {
    name: "Classic Leather Biker Jacket",
    price: 9500,
    description: "Authentic leather biker jacket with silver hardware.",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    tags: ["trending", "luxury"],
    sizes: ["M", "L", "XL"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Gold Pendant Necklace",
    price: 3200,
    description: "Elegant 18k gold plated pendant necklace.",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"],
    tags: ["trending"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
  },
  {
    name: "Boho Chic Tunic",
    price: 2400,
    description: "Embroidered cotton tunic for a relaxed bohemian look.",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=80"],
    tags: ["trending"],
    sizes: ["S", "M", "L"],
    categoryName: "Women's Collection"
  },

  // --- REGULAR PRODUCTS ---
  {
    name: "Classic White Sneakers",
    price: 3800,
    description: "Clean, minimalist white sneakers for everyday wear.",
    stock: 60,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"],
    tags: ["essential"],
    sizes: ["38", "39", "40", "41", "42"],
    categoryName: "Footwear"
  },
  {
    name: "Dinosaur Adventure Backpack",
    price: 2800,
    description: "Fun and functional backpack for little explorers.",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1519704943920-1844582b7bac?w=800&q=80"],
    tags: ["kids"],
    sizes: ["One Size"],
    categoryName: "Kids' Corner"
  },
  {
    name: "Marble Top Coffee Table",
    price: 15500,
    description: "Modern coffee table with a real marble top and gold legs.",
    stock: 5,
    images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80"],
    tags: ["home", "luxury"],
    sizes: ["Standard"],
    categoryName: "Home & Lifestyle"
  }
];

const contentData = [
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
    title: 'Flash Sale is Live!',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    linkUrl: '/products?tag=sale',
    position: 'promotional',
    order: 1,
    isActive: true,
    meta: { subtitle: 'Up to 50% off on selected items', buttonText: 'Shop the Sale' }
  },
  {
    type: 'announcement',
    title: '🔥 FLASH SALE: UP TO 50% OFF! LIMITED TIME ONLY 🔥',
    isActive: true,
    meta: { backgroundColor: '#ff0000', textColor: '#ffffff' }
  },
  {
    type: 'category_feature',
    title: 'FAST DELIVERY',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/709/709790.png',
    linkUrl: '#',
    order: 1,
    isActive: true,
    meta: { subtitle: 'Delivery within 2-3 business days' }
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

    console.log(`✅ STORE FULLY POPULATED WITH FLASH SALE, NEW ARRIVALS, AND TRENDING DATA!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Reseed failed:", error);
    process.exit(1);
  }
};

reseedEverything();
