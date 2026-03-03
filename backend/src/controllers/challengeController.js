import Challenge from "../models/Challenge.js";
import CompletedChallenge from "../models/CompletedChallenge.js";

// ✅ GET challenges by mood
export const getChallengesByMood = async (req, res) => {
  try {
    const { mood } = req.params;

    const challenges = await Challenge.find({ moodTag: mood });

    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ MARK challenge as completed
export const completeChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    // prevent duplicate completion
    const alreadyCompleted = await CompletedChallenge.findOne({
      user: req.user._id,
      challenge: challenge._id,
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: "Already completed" });
    }

    const completed = await CompletedChallenge.create({
      user: req.user._id,
      challenge: challenge._id,
    });

    res.status(201).json({
      message: "Challenge completed successfully 🎉",
      completed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};