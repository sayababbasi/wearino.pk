
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function checkOrder6() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT * FROM orders WHERE id = 6;
    `);

    if (results.length > 0) {
      console.log('Order 6 details:');
      console.log(JSON.stringify(results[0], null, 2));
    } else {
      console.log('Order 6 not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrder6();
