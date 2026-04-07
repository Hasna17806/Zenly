import express from "express";
import jwt from "jsonwebtoken";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import User from "../models/User.js";
import Psychiatrist from "../models/Psychiatrist.js";

const router = express.Router();

// Combined authentication middleware for both users and psychiatrists
const protectBoth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      console.log("Decoded token ID:", decoded.id);
      
      // Try to find as regular user
      let user = await User.findById(decoded.id).select("-password");
      
      if (user) {
        req.user = user;
        req.psychiatrist = null;
        console.log("Authenticated as USER:", user._id, "Role:", user.role);
        return next();
      }
      
      // Try to find as psychiatrist
      let psychiatrist = await Psychiatrist.findById(decoded.id).select("-password");
      
      if (psychiatrist) {
        req.user = psychiatrist;
        req.psychiatrist = psychiatrist;
        console.log("Authenticated as PSYCHIATRIST:", psychiatrist._id);
        return next();
      }
      
      console.log("No user or psychiatrist found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
      
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token" });
};

router.post("/send", protectBoth, sendMessage);
router.get("/:id", protectBoth, getMessages);

export default router;