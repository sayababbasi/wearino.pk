/**
 * Product Controller
 * 
 * Handles all HTTP requests related to product operations in the e-commerce system.
 * Provides CRUD (Create, Read, Update, Delete) operations for products.
 * 
 * Routes:
 * - POST   /api/product          - Create a new product (Admin only)
 * - GET    /api/product          - Get all products (with optional filters)
 * - GET    /api/product/:id      - Get a single product by ID
 * - PUT    /api/product/:id      - Update a product (Admin only)
 * - DELETE /api/product/:id      - Delete a product (Admin only)
 * 
 * Authentication:
 * - Create, Update, Delete: Requires admin authentication (isAdmin middleware)
 * - Read operations: Public (no authentication required)
 * 
 * @module controllers/productController
 */

import Product from "../models/Product.js";
import Category from "../models/Category.js";
import ProductVariant from "../models/ProductVariant.js";
import OrderItem from "../models/OrderItem.js";
import { Sequelize, Op } from "sequelize";
import { clearCache } from "../middleware/cacheMiddleware.js";

/**
 * Create Product
 * 
 * Creates a new product in the database. This is an admin-only operation.
 * 
 * @route POST /api/product
 * @access Private (Admin only)
 * 
 * @param {Object} req.body - Product data
 * @param {string} req.body.name - Product name (required, must be unique)
 * @param {string} req.body.description - Product description (optional)
 * @param {number} req.body.price - Product price (required)
 * @param {number} req.body.categoryId - ID of the category this product belongs to (optional)
 * @param {number} req.body.stock - Initial stock quantity (defaults to 0)
 * @param {Array<string>} req.body.tags - Array of tags (e.g., ["Sale", "New"]) (defaults to [])
 * @param {string} req.body.image - Image URL (optional, can also come from req.file if using file upload)
 * @param {Object} req.file - Uploaded file object (if using multer middleware)
 * 
 * @returns {Object} 201 - Success response with created product
 * @returns {Object} 400 - Product name already exists
 * @returns {Object} 404 - Category not found (if categoryId provided)
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Request body:
 * {
 *   "name": "Classic White Tee",
 *   "description": "A timeless classic",
 *   "price": 29.99,
 *   "categoryId": 1,
 *   "stock": 50,
 *   "tags": ["Sale", "New"]
 * }
 * 
 * // Success response (201):
 * {
 *   "success": true,
 *   "message": "Product created successfully",
 *   "product": { ... }
 * }
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, stock, tags, sizes, sku, status, isTrending, secondaryCategoryIds, discount } = req.body;

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ where: { name } });
    if (existingProduct) {
      return res
        .status(400)
        .json({ message: "Product with this name already exists" });
    }

    // Validate category exists if categoryId is provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category)
        return res.status(404).json({ message: "Category not found" });
    }

    // Process images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => {
        let p = file.path;
        if (!p.startsWith('http')) {
          p = `uploads/${file.filename}`;
        }
        return p;
      });
    } else if (req.body.images) {
      imagePaths = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
    } else if (req.body.image) {
      imagePaths = [req.body.image];
    }

    // Parse fields if they are strings (common with form-data)
    const parsedPrice = price !== undefined && price !== '' ? parseFloat(price) : 0;
    const parsedStock = stock !== undefined && stock !== '' ? parseInt(stock) : 0;
    const parsedDiscount = discount !== undefined && discount !== '' ? parseFloat(discount) : 0;
    const parsedIsTrending = isTrending === 'true' || isTrending === true;

    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = tags ? [tags] : [];
      }
    } else if (!tags) {
      parsedTags = [];
    }

    let parsedSizes = sizes;
    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        parsedSizes = sizes ? [sizes] : [];
      }
    } else if (!sizes) {
      parsedSizes = [];
    }

    // Create the product in the database
    const product = await Product.create({
      name,
      description,
      price: parsedPrice,
      images: imagePaths,
      categoryId: categoryId || null,
      stock: parsedStock,
      tags: parsedTags,
      sizes: parsedSizes,
      sku: sku || null,
      status: status || 'active',
      isTrending: parsedIsTrending,
      discount: parsedDiscount,
    });

    // Handle Secondary Categories (M:N)
    if (secondaryCategoryIds && Array.isArray(secondaryCategoryIds)) {
      await product.setSecondaryCategories(secondaryCategoryIds);
    } else if (typeof secondaryCategoryIds === 'string') {
      // Handle comma-separated string if sent as form-data
      try {
        const ids = secondaryCategoryIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        if (ids.length > 0) {
          await product.setSecondaryCategories(ids);
        }
      } catch (e) {
        console.error("Error parsing secondaryCategoryIds:", e);
      }
    }

    // Flush cache since products updated
    clearCache();

    // Return success response with created product
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Get All Products
 * 
 * Retrieves all products from the database with optional filtering.
 * This is a public endpoint - no authentication required.
 * 
 * @route GET /api/product
 * @access Public
 * 
 * @param {string} req.query.tag - Filter products by tag (e.g., "Sale", "New", "Trending")
 * @param {string} req.query.category - Filter products by category ID
 * @param {string} req.query.department - Filter products by department name (e.g., "Women", "Men")
 * @param {string} req.query.subcategory - Filter products by subcategory name (e.g., "Tops", "Dresses")
 * 
 * @returns {Object} 200 - Success response with array of products
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Get all products:
 * GET /api/product
 * 
 * // Get products with "Sale" tag:
 * GET /api/product?tag=Sale
 * 
 * // Get products in "Women" department:
 * GET /api/product?department=Women
 * 
 * // Get products in "Tops" subcategory:
 * GET /api/product?subcategory=Tops
 * 
 * // Combine filters:
 * GET /api/product?tag=Sale&department=Women
 * 
 * // Success response (200):
 * {
 *   "success": true,
 *   "products": [
 *     {
 *       "id": 1,
 *       "name": "Classic White Tee",
 *       "price": 29.99,
 *       "images": ["https://..."],
 *       "category": { "id": 1, "name": "Tops" },
 *       "tags": ["Sale"],
 *       ...
 *     }
 *   ]
 * }
 * 
 * Note: Multiple query parameters can be combined for advanced filtering.
 * Filters are applied in sequence (AND logic, not OR).
 */
// Standard export for product fetching logic

export const getAllProducts = async (req, res) => {
  try {
    const { tag, category, department, subcategory } = req.query;

    // --- ADVANCED TRENDING ALGORITHM v2 ---
    // 5-signal weighted scoring:
    //   Signal 1 (35%): Sales Velocity  – units sold in last 30 days
    //   Signal 2 (25%): View Momentum   – total page views (normalised)
    //   Signal 3 (20%): Rating Quality  – Bayesian-smoothed rating score
    //   Signal 4 (20%): Recency Bonus   – products < 30 days old get launch boost
    //   Admin Pin: isTrending products always rank first (+100 to score)
    if (tag && tag.toLowerCase() === 'trending') {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Signal 1: Sales velocity — units sold in last 30 days per product
        let salesMap = {};
        try {
          const Order = (await import('../models/Order.js')).default;
          const salesData = await OrderItem.findAll({
            attributes: [
              'productId',
              [Sequelize.fn('SUM', Sequelize.col('OrderItem.quantity')), 'unitsSold'],
            ],
            include: [{
              model: Order,
              attributes: [],
              where: {
                createdAt: { [Op.gte]: thirtyDaysAgo },
                status: { [Op.notIn]: ['cancelled', 'refunded'] }
              },
              required: true
            }],
            group: ['OrderItem.productId'],
            raw: true,
          });
          salesData.forEach(row => {
            if (row.productId) salesMap[row.productId] = parseFloat(row.unitsSold) || 0;
          });
        } catch (salesErr) {
          // Fallback: use all-time sales if recent-order join fails
          const allSales = await OrderItem.findAll({
            attributes: ['productId', [Sequelize.fn('SUM', Sequelize.col('quantity')), 'unitsSold']],
            group: ['productId'],
            raw: true,
          }).catch(() => []);
          allSales.forEach(row => { if (row.productId) salesMap[row.productId] = parseFloat(row.unitsSold) || 0; });
        }

        // Fetch all active products
        const allProducts = await Product.findAll({
          where: { status: 'active' },
          include: [
            { model: Category, as: "category", attributes: ["id", "name"] },
            { model: ProductVariant, as: "variants", where: { isActive: true }, required: false }
          ],
        });

        if (allProducts.length === 0) {
          return res.status(200).json({ success: true, data: { products: [] } });
        }

        // Normalisation maximums
        const MAX_SALES  = Math.max(...Object.values(salesMap), 1);
        const MAX_VIEWS  = Math.max(...allProducts.map(p => p.view || 0), 1);

        // Score each product across 5 signals
        const scored = allProducts.map(p => {
          const data = p.toJSON();
          const id   = data.id;

          // Signal 1 – Sales velocity (35%)
          const salesScore = (salesMap[id] || 0) / MAX_SALES;

          // Signal 2 – View momentum (25%)
          const viewScore = (data.view || 0) / MAX_VIEWS;

          // Signal 3 – Rating quality with Bayesian smoothing (20%)
          // Formula: (n*r + m*C) / (n+m)  where m=5 reviews, C=3.5 prior
          const n = data.reviews || 0;
          const r = data.rating  || 0;
          const bayesian = ((n * r) + (5 * 3.5)) / (n + 5);
          const ratingScore = bayesian / 5;

          // Signal 4 – Recency bonus for products < 30 days old (20%)
          const ageDays = (now - new Date(data.createdAt)) / (1000 * 60 * 60 * 24);
          const recencyScore = ageDays < 30 ? (1 - ageDays / 30) * 0.20 : 0;

          // Composite score
          const trendScore =
            (salesScore  * 0.35) +
            (viewScore   * 0.25) +
            (ratingScore * 0.20) +
             recencyScore;

          return {
            ...data,
            product_id: id,
            category_name: data.category?.name || '',
            images: data.images || [],
            // Admin-pinned products always appear first
            _score: data.isTrending ? trendScore + 100 : trendScore,
          };
        });

        scored.sort((a, b) => b._score - a._score);
        const topTrending = scored.slice(0, 20).map(({ _score, ...rest }) => rest);

        return res.status(200).json({ success: true, data: { products: topTrending } });

      } catch (err) {
        console.error("Advanced trending algo failed, falling back to latest:", err);
        const fallbackProducts = await Product.findAll({
          where: { status: 'active' },
          limit: 20,
          order: [['createdAt', 'DESC']],
          include: [
            { model: Category, as: "category", attributes: ["id", "name"] },
            { model: ProductVariant, as: "variants", where: { isActive: true }, required: false }
          ]
        });
        const sanitized = fallbackProducts.map(p => {
          const data = p.toJSON();
          return { ...data, product_id: data.id, category_name: data.category?.name || '', images: data.images || [] };
        });
        return res.status(200).json({ success: true, data: { products: sanitized } });
      }
    }


    // --- STANDARD FILTERING ---
    // Fetch all products with category info
    // Also include secondary categories for "Global Product Placement" support
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"]
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { isActive: true },
          required: false
        },
        // Include M:N categories if needed for filtering in JS, 
        // OR better: use where clause on association if filtering by category
        {
          model: Category,
          as: "secondaryCategories",
          attributes: ["id", "name"],
          required: false
        }
      ],
      order: [["id", "DESC"]],
    });

    let filteredProducts = products;

    // Filter by Tag
    if (tag) {
      filteredProducts = filteredProducts.filter((product) => {
        const tags = product.tags || [];
        return Array.isArray(tags) && tags.some(t => t.toLowerCase() === tag.toLowerCase());
      });
    }

    // Filter by Category ID (Primary OR Secondary)
    if (category) {
      filteredProducts = filteredProducts.filter((product) => {
        // Check Primary Category
        if (product.categoryId?.toString() === category.toString()) return true;

        // Check Secondary Categories
        if (product.secondaryCategories && Array.isArray(product.secondaryCategories)) {
          return product.secondaryCategories.some(cat => cat.id.toString() === category.toString());
        }

        return false;
      });
    }

    // Filter by Department (Category Name)
    if (department) {
      filteredProducts = filteredProducts.filter((product) => {
        const targetDep = department.toLowerCase();

        // Check Primary
        if (product.category?.name?.toLowerCase() === targetDep) return true;

        // Check Secondary
        if (product.secondaryCategories && Array.isArray(product.secondaryCategories)) {
          return product.secondaryCategories.some(cat => cat.name.toLowerCase() === targetDep);
        }
        return false;
      });
    }

    // Filter by Subcategory (Category Name)
    if (subcategory) {
      filteredProducts = filteredProducts.filter((product) => {
        const targetSub = subcategory.toLowerCase();
        // Check Primary
        if (product.category?.name?.toLowerCase() === targetSub) return true;

        // Check Secondary
        if (product.secondaryCategories && Array.isArray(product.secondaryCategories)) {
          return product.secondaryCategories.some(cat => cat.name.toLowerCase() === targetSub);
        }
        return false;
      });
    }

    // Return filtered products
    // No explicit transformation needed as DB now stores images array natively
    // Checks for null images just in case
    const sanitizedProducts = filteredProducts.map(p => {
      const data = p.toJSON();
      return {
        ...data,
        product_id: data.id,
        category_name: data.category?.name || '',
        images: data.images || []
      };
    });

    res.status(200).json({ success: true, data: { products: sanitizedProducts } });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get Single Product by ID
 * 
 * Retrieves a single product by its ID and increments the view count.
 * This is a public endpoint - no authentication required.
 * 
 * @route GET /api/product/:id
 * @access Public
 * 
 * @param {string} req.params.id - Product ID (from URL parameter)
 * 
 * @returns {Object} 200 - Success response with product data
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Get product with ID 1:
 * GET /api/product/1
 * 
 * // Success response (200):
 * {
 *   "success": true,
 *   "product": {
 *     "id": 1,
 *     "name": "Classic White Tee",
 *     "price": 29.99,
 *     "images": ["https://..."],
 *     "category": { "id": 1, "name": "Tops" },
 *     "view": 42, // Incremented each time this endpoint is called
 *     ...
 *   }
 * }
 * 
 * Side Effect: This endpoint automatically increments the product's view count.
 * This is used for analytics and trending product calculations.
 */
export const getProductById = async (req, res) => {
  try {
    // Find product by primary key (ID) with category information
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"]
        },
        {
          model: ProductVariant,
          as: "variants",
          where: { isActive: true },
          required: false
        },
      ],
    });

    // Return 404 if product doesn't exist
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Increment View Count
    product.view = (product.view || 0) + 1;
    await product.save(); // Persist the updated view count

    // Sanitize product data
    const productData = product.toJSON();
    const sanitizedProduct = {
      ...productData,
      product_id: productData.id,
      category_name: productData.category?.name || '',
      images: productData.images || []
    };

    // Return product
    res.status(200).json({ success: true, data: { product: sanitizedProduct } });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Update Product
 * 
 * Updates an existing product in the database. This is an admin-only operation.
 * Only provided fields are updated (partial update supported).
 * 
 * @route PUT /api/product/:id
 * @access Private (Admin only)
 * 
 * @param {string} req.params.id - Product ID to update
 * @param {Object} req.body - Product data to update (all fields optional)
 * @param {string} req.body.name - New product name
 * @param {string} req.body.description - New product description
 * @param {number} req.body.price - New product price
 * @param {number} req.body.categoryId - New category ID
 * @param {number} req.body.stock - New stock quantity
 * @param {Array<string>} req.body.tags - New tags array
 * @param {string} req.body.image - New image URL
 * @param {Object} req.file - Uploaded file object (if using multer middleware)
 * 
 * @returns {Object} 200 - Success response with updated product
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Update product price and stock:
 * PUT /api/product/1
 * {
 *   "price": 39.99,
 *   "stock": 100
 * }
 * 
 * // Success response (200):
 * {
 *   "success": true,
 *   "message": "Product updated successfully",
 *   "product": { ... }
 * }
 * 
 * Note: This is a partial update - only provided fields are changed.
 * Fields not included in the request body remain unchanged.
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Build update object
    const fields = ['name', 'description', 'status'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    // Specialized handling for SKU to allow nulls instead of empty strings
    if (req.body.sku !== undefined) {
      product.sku = req.body.sku.trim() === '' ? null : req.body.sku.trim();
    }

    // Numeric fields with precision handling
    if (req.body.price !== undefined) {
      const val = parseFloat(req.body.price);
      if (!isNaN(val)) product.price = val;
    }
    if (req.body.stock !== undefined) {
      const val = parseInt(req.body.stock);
      if (!isNaN(val)) product.stock = val;
    }
    if (req.body.categoryId !== undefined) {
      const val = parseInt(req.body.categoryId);
      if (!isNaN(val)) product.categoryId = val;
    }
    if (req.body.discount !== undefined) {
      const val = parseFloat(req.body.discount);
      if (!isNaN(val)) product.discount = val;
    }

    // Boolean fields
    if (req.body.isTrending !== undefined) {
      product.isTrending = req.body.isTrending === 'true' || req.body.isTrending === true;
    }

    // Tags (JSON)
    if (req.body.tags !== undefined) {
      try {
        product.tags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags;
      } catch (e) {
        product.tags = Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags];
      }
    }

    // Sizes (JSON)
    if (req.body.sizes !== undefined) {
      try {
        product.sizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
      } catch (e) {
        product.sizes = Array.isArray(req.body.sizes) ? req.body.sizes : [req.body.sizes];
      }
    }

    // Image handling
    let finalImages = [];

    // 1. Existing images (those that were NOT deleted in the UI)
    const { existingImages } = req.body;
    if (existingImages !== undefined) {
      if (Array.isArray(existingImages)) {
        finalImages = existingImages;
      } else if (existingImages === '') {
        finalImages = [];
      } else {
        finalImages = [existingImages];
      }
    } else {
      // Fallback: if existingImages is missing, we assume no change was intended
      // UNLESS new files are uploaded, then we might want to be careful.
      // But standard behavior is to keep what we have.
      finalImages = product.images || [];
    }

    // 2. New uploads (processed by multer into req.files)
    if (req.files && req.files.length > 0) {
      const newUploadedPaths = req.files.map(f => {
        let p = f.path;
        if (!p.startsWith('http')) {
          p = `uploads/${f.filename}`;
        }
        return p;
      });
      finalImages = [...finalImages, ...newUploadedPaths];
    }

    product.images = finalImages;

    // Save changes
    await product.save();

    // Secondary Categories (M:N)
    const { secondaryCategoryIds } = req.body;
    if (secondaryCategoryIds !== undefined) {
      let ids = [];
      if (Array.isArray(secondaryCategoryIds)) {
        ids = secondaryCategoryIds;
      } else if (typeof secondaryCategoryIds === 'string' && secondaryCategoryIds.trim() !== '') {
        ids = secondaryCategoryIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
      await product.setSecondaryCategories(ids);
    }

    // Flush cache since products updated
    clearCache();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: { product },
    });
  } catch (error) {
    console.error("Error updating product:", error);

    // Handle Sequelize specific errors (Unique constraints, Validation rules)
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const messages = error.errors.map(err => {
        if (err.path === 'name') return 'A product with this name already exists.';
        if (err.path === 'sku') return 'This SKU is already assigned to another product.';
        return err.message;
      });
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }

    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

/**
 * Delete Product
 * 
 * Permanently deletes a product from the database. This is an admin-only operation.
 * 
 * ⚠️ WARNING: This is a hard delete - the product cannot be recovered.
 * Consider implementing soft delete (isDeleted flag) for production use.
 * 
 * @route DELETE /api/product/:id
 * @access Private (Admin only)
 * 
 * @param {string} req.params.id - Product ID to delete
 * 
 * @returns {Object} 200 - Success response
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Internal server error
 * 
 * @example
 * // Delete product with ID 1:
 * DELETE /api/product/1
 * 
 * // Success response (200):
 * {
 *   "success": true,
 *   "message": "Product deleted successfully"
 * }
 * 
 * Side Effects:
 * - Product is removed from database
 * - Related cart items may be affected (depending on CASCADE settings)
 * - Order items referencing this product remain (for order history integrity)
 * 
 * TODO: Consider implementing soft delete instead of hard delete for:
 * - Data recovery
 * - Audit trails
 * - Order history preservation
 */
export const deleteProduct = async (req, res) => {
  try {
    // Extract product ID from URL parameters
    const { id } = req.params;

    // Find the product to delete
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    /**
     * Delete Product
     * 
     * Permanently removes the product from the database.
     * Sequelize will handle any CASCADE deletions based on model associations.
     */
    await product.destroy();

    // Flush cache since products updated
    clearCache();

    // Return success response
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Get Top Selling Products
 * 
 * Retrieves top 5 selling products based on total quantity sold.
 * Used for "Top Products" section in Admin Dashboard.
 */
export const getTopSellingProducts = async (req, res) => {
  try {
    // 1. Aggregate OrderItems to get productId, totalSold, and totalRevenue
    const topSellingItems = await OrderItem.findAll({
      attributes: [
        'productId',
        [Sequelize.fn('SUM', Sequelize.col('quantity')), 'totalSold'],
        [Sequelize.fn('SUM', Sequelize.literal('quantity * price')), 'totalRevenue']
      ],
      where: { status: 'active' }, // Only count non-cancelled items
      group: ['productId'],
      order: [[Sequelize.literal('"totalRevenue"'), 'DESC']],
      limit: 100, // Return more items for better category mapping in frontend
      raw: true,
    });

    if (topSellingItems.length === 0) {
      return res.json({ success: true, products: [] });
    }

    const topIds = topSellingItems.map(item => item.productId);

    // 2. Fetch full Product details ensuring order is preserved
    const products = await Product.findAll({
      where: {
        id: { [Op.in]: topIds }
      },
      include: [
        { model: Category, as: "category", attributes: ["name"] }
      ]
    });

    // 3. Merge data and return
    const result = products.map(p => {
      const stat = topSellingItems.find(i => i.productId === p.id);
      return {
        ...p.toJSON(),
        totalSold: stat ? parseInt(stat.totalSold) : 0,
        category: p.category?.name || 'Uncategorized',
        price: parseFloat(p.price),
        revenue: stat ? parseFloat(stat.totalRevenue) : 0
      };
    }).sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, products: result });
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
