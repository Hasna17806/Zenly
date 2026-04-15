import express from "express";
import {
  loginPsychiatrist,
  getPsychiatristProfile,
  getAllPsychiatrists
} from "../controllers/psychiatristController.js";
import {
  getPsychiatristPatients,
  getPatientDetails,
  getPatientAppointments,
  getPatientMoodHistory,
  getPatientChallenges
} from "../controllers/psychiatristPatientController.js";
import { protectPsychiatrist } from "../middleware/psychiatristAuth.js";

const router = express.Router();

// TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ message: "Psychiatrist route working ✅" });
});

// LOGIN ROUTE
router.post("/login", loginPsychiatrist);

// PROFILE ROUTE
router.get("/profile", protectPsychiatrist, getPsychiatristProfile);

// ALL PSYCHIATRISTS
router.get("/all", getAllPsychiatrists);

// PATIENT MANAGEMENT ROUTES
router.get("/patients", protectPsychiatrist, getPsychiatristPatients);
router.get("/patient/:patientId", protectPsychiatrist, getPatientDetails);
router.get("/patient/:patientId/appointments", protectPsychiatrist, getPatientAppointments);
router.get("/patient/:patientId/mood-history", protectPsychiatrist, getPatientMoodHistory);
router.get("/patient/:patientId/challenges", protectPsychiatrist, getPatientChallenges);

export default router;