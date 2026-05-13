
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function checkSettings() {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query(`
      SELECT * FROM settings WHERE key = 'global_tax_percent';
    `);

    console.log('Settings:');
    console.log(JSON.stringify(results, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSettings();
