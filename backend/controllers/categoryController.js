import Category from "../models/Category.js";
import Product from "../models/Product.js"; // Import Product

// ✅ CREATE Category
export const createCategory = async (req, res) => {
  try {
    const { name, image, description, status, parentId } = req.body;
    let imageUrl = image;

    if (req.file) {
      let path = req.file.path;
      if (path.includes('../uploads') || path.includes('..\\uploads')) {
        path = `uploads/${req.file.filename}`;
      }
      imageUrl = path;
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      image: imageUrl,
      description,
      status,
      parentId: parentId ? parseInt(parentId) : null
    });
    res.status(201).json({ success: true, message: "Category created successfully", data: { category } });
  } catch (error) {
    console.error("Create category error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ READ all Categories
export const getAllCategories = async (req, res) => {
  try {
    console.log("Fetching all categories...");
    const categories = await Category.findAll({
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id'] // lightweight
      }]
    });
    console.log(`Found ${categories.length} categories`);
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) {
    console.error("Get categories error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ READ single Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ success: true, data: { category } });
  } catch (error) {
    console.error("Get category by ID error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ UPDATE Category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image, description, status, parentId } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    let imageUrl = image;
    if (req.file) {
      let path = req.file.path;
      if (path.includes('../uploads') || path.includes('..\\uploads')) {
        path = `uploads/${req.file.filename}`;
      }
      imageUrl = path;
    }

    category.name = name || category.name;
    category.image = imageUrl !== undefined ? imageUrl : category.image;
    category.description = description !== undefined ? description : category.description;
    category.status = status || category.status;
    category.parentId = parentId !== undefined ? (parentId === 'null' || parentId === '' ? null : parseInt(parentId)) : category.parentId;

    await category.save();

    res.status(200).json({ success: true, message: "Category updated successfully", data: { category } });
  } catch (error) {
    console.error("Update category error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ DELETE Category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
