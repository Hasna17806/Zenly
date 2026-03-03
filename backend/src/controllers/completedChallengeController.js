import CompletedChallenge from "../models/CompletedChallenge.js";

// ✅ Mark challenge as completed
export const completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const completed = await CompletedChallenge.create({
      user: req.user._id,
      challenge: challengeId,
    });

    res.status(201).json(completed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get user's completed challenges
export const getCompletedChallenges = async (req, res) => {
  try {
    const completed = await CompletedChallenge.find({
      user: req.user._id,
    }).populate("challenge");

    res.json(completed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};