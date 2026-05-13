
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

async function checkPaymentMethods() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const [results] = await sequelize.query(`
      SELECT * FROM payment_methods;
    `);

    console.log(`Total payment methods: ${results.length}`);
    results.forEach(row => {
      console.log(`- ${row.providerName} (${row.type}): ${row.isActive ? 'Active' : 'Inactive'}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

checkPaymentMethods();
