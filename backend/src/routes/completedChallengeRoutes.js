import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  completeChallenge,
  getCompletedChallenges,
} from "../controllers/completedChallengeController.js";

const router = express.Router();

router.post("/", protect, completeChallenge);
router.get("/", protect, getCompletedChallenges);

export default router;