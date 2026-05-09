import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    // Prevent duplicate
    const exists = await Wishlist.findOne({
      where: { userId: req.user.id, productId },
    });

    if (exists)
      return res.status(400).json({ message: "Already in wishlist" });

    const item = await Wishlist.create({
      userId: req.user.id,
      productId,
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: Product,
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({
      where: { userId: req.user.id, productId: req.params.productId },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
