
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function checkOrders() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const [results] = await sequelize.query(`
      SELECT COUNT(*) FROM orders;
    `);

    console.log(`Total orders: ${results[0].count}`);

    const [latest] = await sequelize.query(`
      SELECT id, order_number, status, created_at FROM orders ORDER BY created_at DESC LIMIT 1;
    `);

    if (latest.length > 0) {
      console.log('Latest order:');
      console.log(JSON.stringify(latest[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

checkOrders();
