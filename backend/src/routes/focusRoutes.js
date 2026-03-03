import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createFocusSession,
  getFocusSessions,
  deleteFocusSession,
} from "../controllers/focusController.js";

const router = express.Router();

router.route("/")
  .post(protect, createFocusSession)
  .get(protect, getFocusSessions);

router.route("/:id")
  .delete(protect, deleteFocusSession);

export default router;