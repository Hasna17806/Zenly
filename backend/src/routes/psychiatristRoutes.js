import express from "express";
import { loginPsychiatrist, getPsychiatristProfile, getAllPsychiatrists } from "../controllers/psychiatristController.js";
import { protectPsychiatrist } from "../middleware/psychiatristAuth.js";

const router = express.Router();

router.post("/login", loginPsychiatrist);
router.get("/profile", protectPsychiatrist, getPsychiatristProfile);
router.get("/all", getAllPsychiatrists);
// router.get("/my-students", protectPsychiatrist, getMyStudents);

export default router;