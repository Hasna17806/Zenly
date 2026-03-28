import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addPsychiatrist,
  getMyPsychiatrists,
  removePsychiatrist
} from "../controllers/savedPsychiatristsController.js";

const router = express.Router();

router.post("/add", protect, addPsychiatrist);
router.get("/my", protect, getMyPsychiatrists);
router.delete("/remove/:id", protect, removePsychiatrist);

export default router;