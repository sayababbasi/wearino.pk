
import { sequelize } from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

const resetAdmin = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected...");

        const email = "admin@fashion.com";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 10);

        const [user, created] = await User.findOrCreate({
            where: { email },
            defaults: {
                name: "Admin User",
                password: hashedPassword,
                role: "admin"
            }
        });

        if (!created) {
            user.password = hashedPassword;
            user.role = "admin";
            await user.save();
            console.log("Admin user updated.");
        } else {
            console.log("Admin user created.");
        }

        console.log(`\nlogin with:\nEmail: ${email}\nPassword: ${password}\n`);
        process.exit(0);

    } catch (error) {
        console.error("Error resetting admin:", error);
        process.exit(1);
    }
};

resetAdmin();
