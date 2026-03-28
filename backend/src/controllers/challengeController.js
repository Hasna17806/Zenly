import Challenge from "../models/Challenge.js";
import CompletedChallenge from "../models/CompletedChallenge.js";

// Get all challenges
export const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get challenges by category
export const getChallengesByMood = async (req, res) => {
  try {
    const { category } = req.params;
    const challenges = await Challenge.find({ category }).sort({ createdAt: -1 });
    res.status(200).json(challenges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create challenge
export const createChallenge = async (req, res) => {
  try {
    const { title, description, category, duration, image } = req.body;

    const challenge = new Challenge({
      title,
      description,
      category,
      duration,
      image
    });

    await challenge.save();

    res.status(201).json({
      message: "Challenge created successfully",
      challenge
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update challenge
export const updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, duration, image } = req.body;

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        duration,
        image
      },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({
      message: "Challenge updated successfully",
      challenge
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete challenge
export const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await Challenge.findByIdAndDelete(id);

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({ message: "Challenge deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Complete challenge
export const completeChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    // prevent duplicate completion
    const alreadyCompleted = await CompletedChallenge.findOne({
      user: req.user._id,
      challenge: id
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    const completion = new CompletedChallenge({
      user: req.user._id,
      challenge: id
    });

    await completion.save();

    res.status(201).json({ message: "Challenge completed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};