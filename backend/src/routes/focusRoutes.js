import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createFocusSession, 
  getFocusSessions, 
  deleteFocusSession,
  getTotalFocusTime 
} from "../controllers/focusController.js";

const router = express.Router();

router.post("/", protect, createFocusSession);
router.get("/", protect, getFocusSessions);
router.delete("/:id", protect, deleteFocusSession);
router.get("/total", protect, getTotalFocusTime);

export default router;