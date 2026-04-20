import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { sendMessage, getChatHistory } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/history", protect, getChatHistory); 

export default router;