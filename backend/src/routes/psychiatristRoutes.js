    // import express from "express";
    // import { loginPsychiatrist, getPsychiatristProfile, getAllPsychiatrists } from "../controllers/psychiatristController.js";
    // import { protectPsychiatrist } from "../middleware/psychiatristAuth.js";

    // const router = express.Router();

    // router.post("/login", loginPsychiatrist);
    // router.get("/profile", protectPsychiatrist, getPsychiatristProfile);
    // router.get("/all", getAllPsychiatrists);
    // // router.get("/my-students", protectPsychiatrist, getMyStudents);

    // export default router;


import express from "express";
import {
  loginPsychiatrist,
  getPsychiatristProfile,
  getAllPsychiatrists
} from "../controllers/psychiatristController.js";
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

export default router;