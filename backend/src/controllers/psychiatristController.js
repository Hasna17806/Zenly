import Psychiatrist from "../models/Psychiatrist.js";
import jwt from "jsonwebtoken";

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Psychiatrist Login
export const loginPsychiatrist = async (req, res) => {

  const { email, password } = req.body;

  try {

    const psychiatrist = await Psychiatrist.findOne({ email });

    if (!psychiatrist) {
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    if (psychiatrist.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin"
      });
    }

    const isMatch = await psychiatrist.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      _id: psychiatrist._id,
      name: psychiatrist.name,
      email: psychiatrist.email,
      token: generateToken(psychiatrist._id),
    });

  } catch (error) {

    res.status(500).json({ message: "Server error" });

  }

};

export const getPsychiatristProfile = async (req, res) => {

  try {

    const psychiatrist = await Psychiatrist
      .findById(req.psychiatrist._id)
      .select("-password");

    res.json(psychiatrist);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const getAllPsychiatrists = async (req, res) => {

  try {

    const psychiatrists = await Psychiatrist.find({
      isBlocked: false
    }).select("-password");

    res.json(psychiatrists);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};