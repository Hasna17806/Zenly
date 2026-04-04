import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import { adminLogin } from "./adminController.js";
import { protectAdmin } from "./adminMiddleware.js";
import CompletedChallenge from "../models/CompletedChallenge.js";

import {
  getAllUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
  getUserCount,
  getUserActivity,
  getWeeklyFocusStats,
  getUserGrowthStats,
  getMoodDistribution,
  getRecentActivity,
  getDashboardStats,
  getAllPsychiatristReviews,
} from "./adminController.js";

import {
  getPsychiatrists,
  createPsychiatrist,
  updatePsychiatrist,
  blockPsychiatrist,
  deletePsychiatrist,
} from "./adminPsychiatristController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

/* ---------------- ADMIN LOGIN ---------------- */
router.post("/login", adminLogin);

/* ---------------- USER MANAGEMENT ---------------- */
router.get("/users", protectAdmin, getAllUsers);
router.get("/users/count", protectAdmin, getUserCount);
router.get("/users/:id", protectAdmin, getUserById);
router.put("/users/:id/block", protectAdmin, toggleBlockUser);
router.delete("/users/:id", protectAdmin, deleteUser);
router.get("/psychiatrist-reviews", protectAdmin, getAllPsychiatristReviews);

/* ---------------- DASHBOARD STATS ---------------- */
router.get("/stats", protectAdmin, getDashboardStats);
router.get("/focus-weekly", protectAdmin, getWeeklyFocusStats);
router.get("/user-growth", protectAdmin, getUserGrowthStats);
router.get("/mood-distribution", protectAdmin, getMoodDistribution);
router.get("/recent-activity", protectAdmin, getRecentActivity);
router.get("/users/:id/activity", protectAdmin, getUserActivity);

/* ---------------- PSYCHIATRIST MANAGEMENT ---------------- */
router.get("/psychiatrists", protectAdmin, getPsychiatrists);
router.post("/psychiatrists", protectAdmin, upload.array('documents', 10), createPsychiatrist);
router.put("/psychiatrists/:id", protectAdmin, upload.array('documents', 10), updatePsychiatrist);
router.put("/psychiatrists/:id/block", protectAdmin, blockPsychiatrist);
router.delete("/psychiatrists/:id", protectAdmin, deletePsychiatrist);

router.get("/recent-challenges", protectAdmin, async (req, res) => {
  try {
    const recentChallenges = await CompletedChallenge.find()
      .sort({ completedAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .lean();
    
    res.json(recentChallenges);
  } catch (error) {
    console.error('Error fetching recent challenges:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;