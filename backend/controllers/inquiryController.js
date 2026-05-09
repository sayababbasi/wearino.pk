import Inquiry  from "../models/Inquiry.js    ";

export const createInquiry = async (req, res) => {
  try {
    const { productId, name, email, message, subject } = req.body;

    const inquiry = await Inquiry.create({
      userId: req.user?.id || null,
      productId: productId || null, // Optional - null for general contact inquiries
      name,
      email,
      message,
      subject: subject || null, // Optional subject from contact form
    });

    res.json({ success: true, inquiry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({
      include: ["User", "Product"],
    });

    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
