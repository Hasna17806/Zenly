import express from "express";
import {
  getPsychiatristReviews,
  addReview,
  updateReview,
  deleteReview,
  getAllReviews,
  toggleReviewVisibility,
  adminDeleteReview
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectAdmin } from "../admin/adminMiddleware.js";

const router = express.Router();

// Public routes (anyone can see reviews)
router.get("/psychiatrist/:psychiatristId", getPsychiatristReviews);

// User routes (authenticated users)
router.post("/add", protect, addReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

// Admin routes
router.get("/admin/all", protectAdmin, getAllReviews);
router.put("/admin/:id/toggle", protectAdmin, toggleReviewVisibility);
router.delete("/admin/:id", protectAdmin, adminDeleteReview);

export default router;