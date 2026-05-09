
import { sequelize } from "./config/db.js";
import Order from "./models/Order.js";
import Product from "./models/Product.js";
import OrderItem from "./models/OrderItem.js";

const createTestOrder = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Create a dummy product if needed
        let product = await Product.findOne();
        if (!product) {
            product = await Product.create({
                name: "Test Product",
                description: "Test Desc",
                price: 100,
                stock: 10,
                images: ["http://example.com/image.png"]
            });
            console.log('Created test product');
        }

        // Create Order
        const order = await Order.create({
            total: 100,
            status: 'pending',
            paymentStatus: 'pending',
            paymentInfo: { method: 'cod' },
            shippingAddress: { name: 'Test User', address: '123 Test St' },
            orderNumber: '#W-TEST-001-' + Date.now()
        });

        // Create OrderItem
        await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: 1,
            price: 100
        });

        console.log('Created test order:', order.id);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createTestOrder();
