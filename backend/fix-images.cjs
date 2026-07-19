const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("postgresql://neondb_owner:npg_qDdi7AUFpXR2@ep-frosty-grass-aq88z58i-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

const validImages = [
  "uploads/image-1778608104434-724396404.png",
  "uploads/image-1778608105399-140867534.png",
  "uploads/image-1778608124036-478753431.png",
  "uploads/image-1778608124130-911478011.png"
];

async function updateImages() {
  try {
    const [products] = await sequelize.query("SELECT id FROM products");
    for (let i = 0; i < products.length; i++) {
      const img = validImages[i % validImages.length];
      await sequelize.query(`UPDATE products SET images = '["${img}"]' WHERE id = ${products[i].id}`);
    }
    console.log(`Updated ${products.length} products with valid local images.`);

    const [categories] = await sequelize.query("SELECT id FROM categories");
    for (let i = 0; i < categories.length; i++) {
      const img = validImages[(i + 1) % validImages.length];
      await sequelize.query(`UPDATE categories SET image = '${img}' WHERE id = ${categories[i].id}`);
    }
    console.log(`Updated ${categories.length} categories with valid local images.`);

    const [contents] = await sequelize.query("SELECT id FROM contents");
    for (let i = 0; i < contents.length; i++) {
      const img = validImages[(i + 2) % validImages.length];
      await sequelize.query(`UPDATE contents SET "imageUrl" = '${img}' WHERE id = ${contents[i].id}`);
    }
    console.log(`Updated ${contents.length} contents with valid local images.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

updateImages();
