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
  { name: "Home & Lifestyle", description: "Decor and essentials for your living space", image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80" },
  { name: "Trending Now", description: "The most popular styles this season", image: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=800&q=80" }
];

const productsData = [
  // --- WOMEN'S COLLECTION ---
  {
    name: "Floral Summer Maxi Dress",
    price: 3499,
    description: "A beautiful, breathable floral dress perfect for summer outings and beach days.",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"],
    tags: ["trending", "new"],
    sizes: ["S", "M", "L", "XL"],
    categoryName: "Women's Collection"
  },
  {
    name: "Classic Silk Blouse",
    price: 2800,
    description: "Elegant silk blouse in pearl white, suitable for both office and evening wear.",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&q=80"],
    tags: ["premium"],
    sizes: ["XS", "S", "M", "L"],
    categoryName: "Women's Collection"
  },
  {
    name: "High-Waist Designer Jeans",
    price: 4200,
    description: "Premium denim with a flattering high-waist fit and distressed detailing.",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80"],
    tags: ["trending"],
    sizes: ["26", "28", "30", "32"],
    categoryName: "Women's Collection"
  },
  {
    name: "Velvet Evening Gown",
    price: 7500,
    description: "A luxurious deep red velvet gown designed for formal events and galas.",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80"],
    tags: ["luxury", "new"],
    sizes: ["S", "M", "L"],
    categoryName: "Women's Collection"
  },
  {
    name: "Oversized Cashmere Scarf",
    price: 1500,
    description: "Soft and warm cashmere scarf in neutral grey, perfect for winter layering.",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80"],
    tags: ["winter", "essential"],
    sizes: ["One Size"],
    categoryName: "Women's Collection"
  },

  // --- MEN'S APPAREL ---
  {
    name: "Premium Cotton Oxford Shirt",
    price: 2500,
    description: "A versatile cotton shirt with a crisp finish and comfortable fit.",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"],
    tags: ["essential", "trending"],
    sizes: ["M", "L", "XL", "XXL"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Urban Leather Jacket",
    price: 8500,
    description: "Genuine leather jacket with minimalist silver hardware for a rugged look.",
    stock: 12,
    images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    tags: ["winter", "luxury"],
    sizes: ["M", "L", "XL"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Slim Fit Cargo Pants",
    price: 3200,
    description: "Durable cotton cargo pants with multiple utility pockets and slim silhouette.",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80"],
    tags: ["new"],
    sizes: ["30", "32", "34", "36"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Graphite Wool Blazer",
    price: 9800,
    description: "Tailored wool blazer in deep graphite, a must-have for professional meetings.",
    stock: 8,
    images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"],
    tags: ["professional", "luxury"],
    sizes: ["48", "50", "52", "54"],
    categoryName: "Men's Apparel"
  },
  {
    name: "Graphic Streetwear Hoodie",
    price: 2900,
    description: "Comfortable fleece hoodie with a bold street-art inspired graphic on the back.",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80"],
    tags: ["trending", "casual"],
    sizes: ["S", "M", "L", "XL"],
    categoryName: "Men's Apparel"
  },

  // --- FOOTWEAR ---
  {
    name: "Street Style Sneakers",
    price: 5500,
    description: "Modern, lightweight sneakers with breathable mesh and cushioned soles.",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
    tags: ["trending", "new"],
    sizes: ["40", "41", "42", "43", "44"],
    categoryName: "Footwear"
  },
  {
    name: "Classic Chelsea Boots",
    price: 7200,
    description: "Suede Chelsea boots in tan, featuring a sleek design and comfortable elastic side panels.",
    stock: 18,
    images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80"],
    tags: ["winter", "premium"],
    sizes: ["41", "42", "43", "44"],
    categoryName: "Footwear"
  },
  {
    name: "Handcrafted Leather Loafers",
    price: 6500,
    description: "Timeless leather loafers with a polished finish, perfect for formal and casual wear.",
    stock: 15,
    images: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=800&q=80"],
    tags: ["premium", "classic"],
    sizes: ["40", "41", "42", "43"],
    categoryName: "Footwear"
  },
  {
    name: "Minimalist White Trainers",
    price: 4200,
    description: "Clean and simple white trainers that pair perfectly with any outfit.",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80"],
    tags: ["essential"],
    sizes: ["38", "39", "40", "41", "42"],
    categoryName: "Footwear"
  },

  // --- KIDS' CORNER ---
  {
    name: "Cotton Dinosaur PJs",
    price: 1500,
    description: "Soft organic cotton pajamas with a fun dinosaur print for a cozy night's sleep.",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1519704943920-1844582b7bac?w=800&q=80"],
    tags: ["new", "kids"],
    sizes: ["2Y", "4Y", "6Y", "8Y"],
    categoryName: "Kids' Corner"
  },
  {
    name: "Little Explorer Denim Jacket",
    price: 2400,
    description: "Durable and stylish denim jacket for kids, built for adventure.",
    stock: 20,
    images: ["https://images.unsplash.com/photo-1519457431-757104681f85?w=800&q=80"],
    tags: ["kids", "trending"],
    sizes: ["4Y", "6Y", "8Y", "10Y"],
    categoryName: "Kids' Corner"
  },

  // --- HOME & LIFESTYLE ---
  {
    name: "Minimalist Ceramic Vase",
    price: 1800,
    description: "A sleek, matte white ceramic vase that adds a touch of elegance to any room.",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800&q=80"],
    tags: ["decor", "new"],
    sizes: ["Small", "Medium", "Large"],
    categoryName: "Home & Lifestyle"
  },
  {
    name: "Aromatherapy Soy Candle",
    price: 950,
    description: "Hand-poured soy candle with lavender and eucalyptus essential oils for relaxation.",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?w=800&q=80"],
    tags: ["lifestyle", "gift"],
    sizes: ["250g"],
    categoryName: "Home & Lifestyle"
  },
  {
    name: "Woven Cotton Throw",
    price: 3200,
    description: "Soft woven cotton throw blanket in a herringbone pattern, perfect for the sofa.",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80"],
    tags: ["home", "essential"],
    sizes: ["Standard"],
    categoryName: "Home & Lifestyle"
  },

  // --- ACCESSORIES ---
  {
    name: "Midnight Chronograph Watch",
    price: 12500,
    description: "Sleek black watch with leather strap and precise Japanese movement.",
    stock: 10,
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
    tags: ["exclusive", "trending"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
  },
  {
    name: "Aviator Gold Sunglasses",
    price: 1800,
    description: "Classic aviator style with polarized lenses and 18k gold-toned frames.",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1511499767390-90342f16b147?w=800&q=80"],
    tags: ["summer"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
  },
  {
    name: "Leather Minimalist Wallet",
    price: 1200,
    description: "Slim genuine leather wallet with RFID blocking and multiple card slots.",
    stock: 100,
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80"],
    tags: ["essential"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
  },
  {
    name: "Silk Pocket Square",
    price: 850,
    description: "100% silk pocket square with a subtle paisley pattern to complete your formal look.",
    stock: 60,
    images: ["https://images.unsplash.com/photo-1520903074183-febab54c9524?w=800&q=80"],
    tags: ["men", "professional"],
    sizes: ["One Size"],
    categoryName: "Luxury Accessories"
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
    title: 'Winter Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1486308510493-aa64833637bc?w=1200',
    linkUrl: '/products?tag=winter',
    position: 'hero',
    order: 2,
    isActive: true,
    meta: { subtitle: 'Stay warm and stylish', buttonText: 'Explore Collection' }
  },
  {
    type: 'banner',
    title: 'Kids Adventure Sale',
    imageUrl: 'https://images.unsplash.com/photo-1519704943920-1844582b7bac?w=1200',
    linkUrl: '/products?category=Kids',
    position: 'hero',
    order: 3,
    isActive: true,
    meta: { subtitle: 'Up to 30% off on kids wear', buttonText: 'Shop Kids' }
  },
  {
    type: 'announcement',
    title: 'FREE SHIPPING ON ALL ORDERS OVER RS 2000! SHOP NOW',
    isActive: true,
    meta: { backgroundColor: '#000000', textColor: '#ffffff' }
  },
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
    title: '7-DAY RETURNS',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1585/1585141.png',
    linkUrl: '#',
    order: 2,
    isActive: true,
    meta: { subtitle: 'Hassle-free exchange policy' }
  },
  {
    type: 'category_feature',
    title: '100% SECURE',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/1160/1160285.png',
    linkUrl: '#',
    order: 3,
    isActive: true,
    meta: { subtitle: 'Payments are fully encrypted' }
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

    console.log(`✅ STORE MASSIVELY POPULATED WITH ${productsData.length} PREMIUM PRODUCTS!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Reseed failed:", error);
    process.exit(1);
  }
};

reseedEverything();
