const { Sequelize } = require("sequelize");
const sequelize = new Sequelize("postgresql://neondb_owner:npg_qDdi7AUFpXR2@ep-frosty-grass-aq88z58i-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require");

async function checkImages() {
  const [products] = await sequelize.query("SELECT id, name, images FROM products");
  const brokenProducts = products.filter(p => !p.images || !p.images[0] || p.images[0].includes("unsplash.com") || p.images[0].includes("localhost") || p.images[0].includes("via.placeholder.com"));
  
  console.log("Broken products:", brokenProducts.length, "Total:", products.length);

  const [categories] = await sequelize.query("SELECT id, name, image FROM categories");
  const brokenCategories = categories.filter(c => !c.image || c.image.includes("unsplash.com") || c.image.includes("localhost") || c.image.includes("via.placeholder.com"));
  
  console.log("Broken categories:", brokenCategories.length, "Total:", categories.length);

  const [contents] = await sequelize.query('SELECT id, type, "imageUrl" FROM contents');
  const brokenContents = contents.filter(c => !c.imageUrl || c.imageUrl.includes("unsplash.com") || c.imageUrl.includes("localhost") || c.imageUrl.includes("via.placeholder.com"));
  
  console.log("Broken contents:", brokenContents.length, "Total:", contents.length);
  
  process.exit(0);
}

checkImages();
