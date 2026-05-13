
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: console.log,
});

async function fixSchema() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB');

    const tablesToFix = [
      { table: 'orders', columns: ['status', 'payment_status'], defaults: ['pending_payment', 'pending'] },
      { table: 'order_items', columns: ['status'], defaults: ['active'] },
      { table: 'products', columns: ['status'], defaults: ['active'] },
      { table: 'users', columns: ['role'], defaults: ['user'] },
      { table: 'categories', columns: ['status'], defaults: ['active'] },
      { table: 'payment_proofs', columns: ['status'], defaults: ['pending'] },
      { table: 'payment_methods', columns: ['type'], defaults: [null] },
      { table: 'return_requests', columns: ['status', 'refund_status'], defaults: ['pending', 'pending'] },
    ];

    for (const { table, columns, defaults } of tablesToFix) {
      console.log(`Fixing table: ${table}...`);
      
      // Check if table exists
      const [tableExists] = await sequelize.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = '${table}'
        );
      `);

      if (!tableExists[0].exists) {
        console.log(`Table ${table} does not exist, skipping...`);
        continue;
      }

      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const defaultValue = defaults[i];

        console.log(`  Fixing column: ${column}...`);
        
        try {
          // Drop default first
          await sequelize.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" DROP DEFAULT;`);
          
          // Alter type to varchar
          await sequelize.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" TYPE CHARACTER VARYING(255) USING "${column}"::text;`);
          
          // Set default back if not null
          if (defaultValue !== null) {
            await sequelize.query(`ALTER TABLE "${table}" ALTER COLUMN "${column}" SET DEFAULT '${defaultValue}';`);
          }
        } catch (colError) {
          console.warn(`  Could not fix column ${column} in ${table}:`, colError.message);
        }
      }
    }

    console.log('Schema wide fix successfully completed!');
  } catch (error) {
    console.error('Error fixing schema:', error);
  } finally {
    await sequelize.close();
  }
}

fixSchema();
