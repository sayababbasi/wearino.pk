
import { connectDB } from "./config/db.js";
import PaymentMethod from "./models/PaymentMethod.js";
import dotenv from "dotenv";

dotenv.config();

const seedPaymentMethods = async () => {
    try {
        await connectDB();

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

        console.log("✅ Payment methods seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding payment methods:", error);
        process.exit(1);
    }
};

seedPaymentMethods();
