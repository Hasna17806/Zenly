import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChallengesByMood,
  completeChallenge,
} from "../controllers/challengeController.js";

const router = express.Router();

// Get challenges by mood
router.get("/:mood", protect, getChallengesByMood);

// Mark challenge complete
router.post("/:id/complete", protect, completeChallenge);

export default router;