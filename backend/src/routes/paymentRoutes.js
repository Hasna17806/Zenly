import express from "express";
import {
  createPayPalOrder,
  capturePayPalOrder,
  getPaymentStatus,
  getAllPayments,
  getPsychiatristEarnings
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectPsychiatrist } from "../middleware/psychiatristAuth.js";
import { protectAdmin } from "../admin/adminMiddleware.js";

const router = express.Router();

// User routes
router.post("/create-order", protect, createPayPalOrder);
router.post("/capture-order", protect, capturePayPalOrder);
router.get("/status/:appointmentId", protect, getPaymentStatus);

// Psychiatrist routes
router.get("/psychiatrist/earnings", protectPsychiatrist, getPsychiatristEarnings);

// Admin routes
router.get("/admin/all", protectAdmin, getAllPayments);

export default router;