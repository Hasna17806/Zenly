import express from "express";
import {
  getAvailableSlots,
  getAvailableDates,
  addAvailability,
  getPsychiatristAvailabilities,
  deleteAvailability,
  bookSlot 
} from "../controllers/availabilityController.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectPsychiatrist } from "../middleware/psychiatristAuth.js";

const router = express.Router();

// User routes (patients)
router.get("/slots/:psychiatristId/:date", protect, getAvailableSlots);
router.get("/dates/:psychiatristId", protect, getAvailableDates);

// Psychiatrist routes
router.get("/psychiatrist", protectPsychiatrist, getPsychiatristAvailabilities);
router.post("/add", protectPsychiatrist, addAvailability);
router.delete("/:id", protectPsychiatrist, deleteAvailability);

// ⭐ Optional: Separate endpoint for booking slots (if needed)
router.post("/book-slot", protect, bookSlot);

export default router;