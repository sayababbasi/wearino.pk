// Shared product data source
const brands = ['Forever 21', 'Z Supply', 'Love & Harmony', 'Premium Label', 'Others'];
const departments = ['Women', 'Men', 'Kids', 'Plus Size', 'Petite'];
const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Accessories'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Brown', 'Gray'];
const skirtLengths = ['Mini', 'Midi', 'Maxi'];
const sleeveLengths = ['Sleeveless', 'Short Sleeve', 'Long Sleeve', '3/4 Sleeve'];
const productTypes = ['Shirt', 'Dress', 'Pants', 'Jacket', 'Shoes'];

// Product data matching images
const productData = [
  { imageId: '1521572163474-6864f9cf17ab', name: 'Classic White Tee', description: 'A timeless classic white tee made from premium cotton. Perfect for everyday wear and easy to style with any outfit.', type: 'Shirt', dept: 'Women' },
  { imageId: '1551028719-00167b16eac5', name: 'Denim Jacket', description: 'Classic denim jacket with a modern fit. Features button closure and multiple pockets for a stylish look.', type: 'Jacket', dept: 'Women' },
  { imageId: '1515372039744-b8f02a3ae446', name: 'Summer Dress', description: 'Lightweight summer dress perfect for warm weather. Flowy design with elegant patterns for a feminine look.', type: 'Dress', dept: 'Women' },
  { imageId: '1543163521-1bf539c55dd2', name: 'Leather Boots', description: 'Premium leather boots with cushioned insole. Durable and stylish for any occasion, perfect for all seasons.', type: 'Shoes', dept: 'Accessories' },
  { imageId: '1602810318383-e386cc2a3ccf', name: 'Casual Shirt', description: 'Comfortable casual shirt made from breathable fabric. Perfect for casual outings and everyday comfort.', type: 'Shirt', dept: 'Men' },
  { imageId: '1483985988355-763728e1935b', name: 'Fashion Blouse', description: 'Elegant blouse with modern design. Versatile piece that can be dressed up or down for any occasion.', type: 'Shirt', dept: 'Women' },
  { imageId: '1490481651871-ab68de25d43d', name: 'Stylish Top', description: 'Trendy top with contemporary style. Made from high-quality materials for comfort and durability.', type: 'Shirt', dept: 'Women' },
  { imageId: '1441984904996-e0b6ba687e04', name: 'Fashionable Outfit', description: 'Complete fashionable outfit set. Perfect combination of style and comfort for the modern wardrobe.', type: 'Dress', dept: 'Women' },
  { imageId: '1603252109303-2751441dd157', name: 'Layering Cardigan', description: 'Versatile cardigan perfect for layering. Soft and cozy, ideal for transitional weather.', type: 'Jacket', dept: 'Women' },
  { imageId: '1469334031218-e382a71b716b', name: 'Designer Blazer', description: 'Professional blazer with tailored fit. Perfect for business casual or formal occasions.', type: 'Jacket', dept: 'Women' },
  { imageId: '1509631179647-0177331693ae', name: 'Casual Pants', description: 'Comfortable casual pants with modern fit. Perfect for everyday wear with any style.', type: 'Pants', dept: 'Men' },
  { imageId: '1483181957632-8bda974cbc91', name: 'Elegant Dress', description: 'Elegant dress with sophisticated design. Perfect for special occasions and evening events.', type: 'Dress', dept: 'Women' },
  { imageId: '1583743814966-8936f5b7be1a', name: 'Branded T-Shirt', description: 'Premium branded t-shirt with quality fabric. Comfortable fit with stylish design elements.', type: 'Shirt', dept: 'Men' },
  { imageId: '1581655353564-df123a1eb820', name: 'Fashion Accessory', description: 'Stylish fashion accessory to complete your look. High-quality materials and contemporary design.', type: 'Accessories', dept: 'Accessories' },
  { imageId: '1515889571694-4b1b0b0b0b0b', name: 'Trendy Outfit', description: 'On-trend outfit piece with modern aesthetics. Versatile and stylish for any fashion-forward wardrobe.', type: 'Dress', dept: 'Women' },
];

// Generate a single product with deterministic values
const generateProduct = (index: number) => {
  const seed = index + 1;
  const priceBase = 20 + (seed % 130);
  const ratingBase = 4 + (seed % 10) / 10;
  
  // Get product data matching the image
  const productInfo = productData[seed % productData.length];
  
  // Map product type to category
  const typeToCategory: Record<string, string> = {
    'Shirt': 'Tops',
    'Dress': 'Dresses',
    'Jacket': 'Outerwear',
    'Pants': 'Bottoms',
    'Shoes': 'Accessories',
    'Accessories': 'Accessories',
  };
  
  const mappedCategory = typeToCategory[productInfo.type] || 'Tops';
  const deptIndex = departments.indexOf(productInfo.dept) >= 0 
    ? departments.indexOf(productInfo.dept) 
    : 0;
  const catIndex = categories.indexOf(mappedCategory) >= 0 
    ? categories.indexOf(mappedCategory) 
    : 0;
  const brandIndex = seed % brands.length;
  const colorIndex = seed % colors.length;
  const sizeIndex1 = seed % sizes.length;
  const sizeIndex2 = (seed + 1) % sizes.length;
  const sleeveIndex = seed % sleeveLengths.length;
  
  return {
    product_id: `${seed}`,
    name: productInfo.name,
    description: productInfo.description,
    price: priceBase,
    image: `https://images.unsplash.com/photo-${productInfo.imageId}?w=400&h=600&fit=crop`,
    rating: ratingBase,
    category_name: productInfo.dept,
    category_id: `${(deptIndex % 4) + 1}`,
    tags: seed % 3 === 0 ? ['New'] : seed % 5 === 0 ? ['Sale'] : [],
    discount: seed % 5 === 0 ? 40 + (seed % 20) : undefined,
    // Additional filter attributes
    brand: brands[brandIndex],
    department: productInfo.dept,
    productCategory: mappedCategory,
    availableSizes: [sizes[sizeIndex1], sizes[sizeIndex2]],
    color: colors[colorIndex],
    skirtLength: seed % 3 === 0 ? skirtLengths[seed % skirtLengths.length] : undefined,
    sleeveLength: sleeveLengths[sleeveIndex],
  };
};

// Generate all products (memoized for consistency)
let cachedProducts: ReturnType<typeof generateProduct>[] | null = null;

// Generate all products
export const getAllProducts = () => {
  if (cachedProducts) {
    return cachedProducts;
  }
  
  cachedProducts = Array.from({ length: 50 }, (_, i) => generateProduct(i));
  return cachedProducts;
};

// Get product by ID with detailed information
export const getProductById = (id: string) => {
  const allProducts = getAllProducts();
  const baseProduct = allProducts.find((p) => p.product_id === id);
  
  if (!baseProduct) {
    return null;
  }

  // Generate additional images for the product
  const productIndex = parseInt(id) || 0;
  const seed = productIndex;
  
  // Valid Unsplash photo IDs for fashion/clothing products
  const validImageIds = [
    '1521572163474-6864f9cf17ab', // White shirt
    '1551028719-00167b16eac5',    // Denim jacket
    '1515372039744-b8f02a3ae446', // Summer dress
    '1543163521-1bf539c55dd2',    // Leather boots
    '1602810318383-e386cc2a3ccf', // Casual shirt
    '1483985988355-763728e1935b', // Fashion items
    '1490481651871-ab68de25d43d', // Clothing
    '1441984904996-e0b6ba687e04', // Fashion store
  ];
  
  const baseImageIndex = seed % validImageIds.length;
  const images = [
    baseProduct.image,
    `https://images.unsplash.com/photo-${validImageIds[(baseImageIndex + 1) % validImageIds.length]}?w=800&h=1200&fit=crop`,
    `https://images.unsplash.com/photo-${validImageIds[(baseImageIndex + 2) % validImageIds.length]}?w=800&h=1200&fit=crop`,
    `https://images.unsplash.com/photo-${validImageIds[(baseImageIndex + 3) % validImageIds.length]}?w=800&h=1200&fit=crop`,
  ];

  // Generate detailed product information with deterministic values
  const reviews = 50 + (seed % 200);
  const stock = 20 + (seed % 50);
  
  // Get colors (including base color and 3 other colors)
  const allAvailableColors = [
    baseProduct.color,
    ...colors.filter(c => c !== baseProduct.color).slice(0, 3)
  ];
  
  const productDetails = {
    ...baseProduct,
    images,
    reviews,
    sizes: sizes,
    colors: allAvailableColors,
    stock,
    features: [
      '100% Premium Quality',
      'Machine Washable',
      'Comfortable Fit',
      'Durable Material',
      'Stylish Design',
    ],
  };

  return productDetails;
};

// Get related products (same category, excluding current product)
export const getRelatedProducts = (productId: string, limit: number = 4) => {
  const allProducts = getAllProducts();
  const currentProduct = allProducts.find((p) => p.product_id === productId);
  
  if (!currentProduct) {
    return [];
  }

  return allProducts
    .filter(
      (p) =>
        p.product_id !== productId &&
        (p.category_name === currentProduct.category_name ||
          p.department === currentProduct.department)
    )
    .slice(0, limit);
};
