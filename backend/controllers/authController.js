import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
if (!process.env.JWT_SECRET) {
    console.warn(
        "WARNING: JWT_SECRET is not set. Using a default development secret. Set JWT_SECRET in .env for production."
    );
}

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        // Basic input validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: 'user' // Force default role for public registration
        });
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        res.status(201).json({ user: newUser, token });

    } catch (error) {
        // Log full error for debugging
        console.error("registration error:", error && error.stack ? error.stack : error);
        const payload = { message: "Server error" };
        if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
        res.status(500).json(payload);
    }
};


export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Email not registered" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({ user, token });
    } catch (error) {
        console.error("login error:", error && error.stack ? error.stack : error);
        const payload = { message: "Server error" };
        if (process.env.NODE_ENV !== "production") payload.error = error.message || error;
        res.status(500).json(payload);
    }
};