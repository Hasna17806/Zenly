import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getUserNotifications);
router.put("/read/:id", protect, markNotificationAsRead);
router.put("/read-all", protect, markAllNotificationsAsRead);

export default router;