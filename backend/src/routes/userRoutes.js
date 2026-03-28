import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";   


const router = express.Router();

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

router.put("/profile", protect, async (req, res) => {
  try {

    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;