import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { 
  forgotPassword, 
  resetPassword,
  verifyResetToken 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password/:token', resetPassword);

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
