import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createMoodLog,
  getMoodLogs,
  deleteMoodLog,
} from "../controllers/moodController.js";

const router = express.Router();

router.post("/", protect, createMoodLog);
router.get("/", protect, getMoodLogs);       
router.delete("/:id", protect, deleteMoodLog);

export default router;