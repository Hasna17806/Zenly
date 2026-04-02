import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  completeChallenge,
  getCompletedChallenges,
  getUserProgress,
} from "../controllers/completedChallengeController.js";

const router = express.Router();

router.post("/", protect, completeChallenge);
router.get("/", protect, getCompletedChallenges);
router.get("/progress", protect, getUserProgress);

export default router;