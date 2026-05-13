
import express from "express";
import dotenv from "dotenv";

// Load environment variables FIRST before importing other modules
dotenv.config();

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import WishlistRoutes from "./routes/wishlistRoutes.js";
import inquiryRoutes from "./routes/inquiryRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import xss from "xss-clean";
import { apiLimiter as rateLimiter } from "./middleware/apiLimiter.js";
import hpp from "hpp";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models to ensure they're registered with Sequelize
// Order matters! Import dependencies first (Order before Review)
import "./models/Order.js";
import "./models/Coupon.js";
import "./models/Review.js";
import "./models/ProductVariant.js";
import "./models/ReturnRequest.js";
import "./models/Message.js";
import "./models/Setting.js";
import "./models/DeliveryZone.js";
import "./models/PaymentMethod.js";
import "./models/PaymentProof.js";

import http from 'http';
import { Server } from 'socket.io';
import { setupSocket } from './sockets/chatSocket.js';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize socket logic
setupSocket(io);

const PORT = process.env.PORT || 5001;
connectDB();
// app.use(helmet({
//   crossOriginResourcePolicy: { policy: "cross-origin" }
// }));
app.use(express.json());
// Parse URL-encoded bodies (form submissions) in addition to JSON
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));
app.use(morgan("dev"));

// Basic health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "UP", timestamp: new Date() });
});
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));


import contentRoutes from "./routes/contentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import configRoutes from "./routes/configRoutes.js";

// Routes
app.use("/api/content", contentRoutes);
app.use("/api/auth", rateLimiter, authRoutes);
app.use("/api/product", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/wishlist", WishlistRoutes);
app.use("/api/inquiry", inquiryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/payment", paymentRoutes)
app.use("/api/chat", chatRoutes); // Keep bot chat for now
app.use("/api/messages", messageRoutes); // New Support Chat
app.use("/api", couponRoutes);
app.use("/api", reviewRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/config", configRoutes);
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error error handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
