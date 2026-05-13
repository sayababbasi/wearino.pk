
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();
import Order from './models/Order.js';
import OrderItem from './models/OrderItem.js';
import Product from './models/Product.js';
import User from './models/User.js';
import PaymentProof from './models/PaymentProof.js';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: true, // Enable logging to see the SQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Initialize models
Order.init(Order.rawAttributes, { sequelize, tableName: 'orders', underscored: true });
OrderItem.init(OrderItem.rawAttributes, { sequelize, tableName: 'order_items', underscored: true });
Product.init(Product.rawAttributes, { sequelize, tableName: 'products', underscored: true });
User.init(User.rawAttributes, { sequelize, tableName: 'users', underscored: true });
PaymentProof.init(PaymentProof.rawAttributes, { sequelize, tableName: 'payment_proofs', underscored: true });

// Setup associations
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });
Order.hasMany(OrderItem, { foreignKey: "orderId", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });
Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });
Order.hasMany(PaymentProof, { foreignKey: "orderId" });
PaymentProof.belongsTo(Order, { foreignKey: "orderId" });

async function testFetch() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const orders = await Order.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        {
          model: OrderItem,
          include: {
            model: Product,
            attributes: ['id', 'name', 'images', 'price', 'sku', 'description', 'stock']
          }
        },
        { model: PaymentProof }
      ],
      order: [['createdAt', 'DESC']],
    });

    console.log(`Successfully fetched ${orders.length} orders.`);
    process.exit(0);
  } catch (error) {
    console.error('Fetch failed:', error);
    process.exit(1);
  }
}

testFetch();
