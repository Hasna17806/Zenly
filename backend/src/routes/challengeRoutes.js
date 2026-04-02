import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChallengesByMood,
  completeChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  getChallengesByMoodTag
} from "../controllers/challengeController.js";

const router = express.Router();

// ================= ADMIN ROUTES =================
router.get("/admin/all", getAllChallenges);
router.post("/admin/create", createChallenge);
router.put("/admin/update/:id", updateChallenge);
router.delete("/admin/delete/:id", deleteChallenge);

// ================= USER ROUTES =================
router.get("/", protect, getAllChallenges); 
router.get("/category/:category", protect, getChallengesByMood);
router.post("/:id/complete", protect, completeChallenge);
router.get("/mood/:moodTag", protect, getChallengesByMoodTag);


export default router;