import express from "express";
import { register, login } from "../controllers/authController.js";
import { getAllUsers, updateUserRole, deleteUser, createUser } from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Admin user management routes
router.get("/users", protect, isAdmin, getAllUsers);
router.post("/users", protect, isAdmin, createUser);
router.put("/users/:id/role", protect, isAdmin, updateUserRole);
router.delete("/users/:id", protect, isAdmin, deleteUser);

export default router;
