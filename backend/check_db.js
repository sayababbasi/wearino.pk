import { Sequelize } from 'sequelize';
const sequelize = new Sequelize('postgres://postgres:abbe@localhost:5432/product_listing_db');
sequelize.query('UPDATE "contents" SET "imageUrl" = \'uploads/\' || split_part("imageUrl", \'uploads\\\', 2) WHERE "imageUrl" LIKE \'D:\\%\'').then(() => {
  console.log('Fixed image paths');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
