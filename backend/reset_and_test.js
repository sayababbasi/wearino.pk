
import { sequelize, connectDB } from "./config/db.js";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import OrderItem from "./models/OrderItem.js";

const run = async () => {
    try {
        // 1. Drop OrderItems to clear bad constraints
        await sequelize.query('DROP TABLE IF EXISTS "OrderItems" CASCADE');
        console.log("Dropped OrderItems");

        // 2. Sync DB (Recreates OrderItems with correct FK to Orders)
        // Note: connectDB inside db.js runs sync({alter:true})
        await connectDB();
        console.log("DB Synced");

        // 3. Create Data
        let product = await Product.findOne();
        if (!product) {
            product = await Product.create({
                name: "Test Product",
                description: "Test Desc",
                price: 100,
                stock: 10,
                images: ["http://example.com/image.png"]
            });
        }

        const order = await Order.create({
            total: 100,
            status: 'pending',
            paymentStatus: 'pending',
            paymentInfo: { method: 'cod' },
            shippingAddress: { name: 'Test User', address: '123 Test St' },
            orderNumber: '#W-TEST-002-' + Date.now()
        });
        console.log("Order created with ID:", order.id);

        await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: 1,
            price: 100
        });
        console.log("OrderItem created successfully");

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

run();
