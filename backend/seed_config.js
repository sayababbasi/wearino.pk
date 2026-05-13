
import { connectDB, sequelize } from "./config/db.js";
import PaymentMethod from "./models/PaymentMethod.js";
import DeliveryZone from "./models/DeliveryZone.js";
import Setting from "./models/Setting.js";
import Coupon from "./models/Coupon.js";
import dotenv from "dotenv";

dotenv.config();

const seedConfig = async () => {
    try {
        await connectDB();

        console.log("Syncing database to create new tables...");
        // alter: true will add missing tables/columns without dropping existing data
        await sequelize.sync({ alter: true });
        console.log("✅ Database synced.");

        console.log("Seeding payment methods...");
        const methods = [
            {
                type: 'cod',
                providerName: 'Cash on Delivery',
                instructions: 'Pay when you receive your order.',
                isActive: true
            },
            {
                type: 'bank_transfer',
                providerName: 'Meezan Bank',
                accountTitle: 'Revotic AI Pvt Ltd',
                accountNumber: '1234567890',
                iban: 'PK00MEZN001234567890',
                instructions: 'Please transfer the amount and upload the screenshot.',
                isActive: true
            },
            {
                type: 'easypaisa',
                providerName: 'Easypaisa',
                accountTitle: 'Saqib',
                accountNumber: '03001234567',
                instructions: 'Send money to our Easypaisa account.',
                isActive: true
            }
        ];

        for (const method of methods) {
            await PaymentMethod.findOrCreate({
                where: { type: method.type },
                defaults: method
            });
        }

        console.log("Seeding delivery zones...");
        const zones = [
            { name: 'Lahore', charge: 150.00, freeDeliveryThreshold: 5000.00, estimatedDays: '1-2 Days' },
            { name: 'Karachi', charge: 250.00, freeDeliveryThreshold: 7000.00, estimatedDays: '3-5 Days' },
            { name: 'Islamabad', charge: 200.00, freeDeliveryThreshold: 6000.00, estimatedDays: '2-3 Days' },
            { name: 'Others', charge: 300.00, freeDeliveryThreshold: 10000.00, estimatedDays: '5-7 Days' }
        ];

        for (const zone of zones) {
            await DeliveryZone.findOrCreate({
                where: { name: zone.name },
                defaults: zone
            });
        }

        console.log("Seeding settings...");
        const settings = [
            { key: 'site_name', value: 'Wearino', group: 'general' },
            { key: 'contact_email', value: 'support@wearino.pk', group: 'contact' },
            { key: 'free_shipping_threshold', value: '5000', group: 'order' }
        ];

        for (const setting of settings) {
            await Setting.findOrCreate({
                where: { key: setting.key },
                defaults: setting
            });
        }

        console.log("Seeding coupons...");
        const coupons = [
            {
                code: 'SAVE20',
                discountType: 'percentage',
                discountValue: 20.00,
                minPurchase: 100.00,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                isActive: true
            },
            {
                code: 'WELCOME10',
                discountType: 'fixed',
                discountValue: 10.00,
                minPurchase: 50.00,
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                isActive: true
            }
        ];

        for (const coupon of coupons) {
            await Coupon.findOrCreate({
                where: { code: coupon.code },
                defaults: coupon
            });
        }

        console.log("✅ Config and Coupons seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding config:", error);
        process.exit(1);
    }
};

seedConfig();
