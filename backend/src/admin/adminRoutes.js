import express from "express";
import { adminLogin } from "./adminController.js";
import { protectAdmin } from "./adminMiddleware.js";
import {
  getAllUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
  getUserCount
} from "./adminController.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/users", protectAdmin, getAllUsers);

router.get("/users/count", protectAdmin, getUserCount);

router.get("/users/:id", protectAdmin, getUserById);

router.put("/users/:id/block", protectAdmin, toggleBlockUser);

router.delete("/users/:id", protectAdmin, deleteUser);

// protected admin routes
router.get("/dashboard", protectAdmin, (req, res) => {
  res.json({ message: "Welcome Admin 👑" });
});

export default router;