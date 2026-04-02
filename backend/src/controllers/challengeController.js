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
    const { title, description, category, duration, image, moodTag } = req.body;

    const challenge = await Challenge.create({
      title,
      description,
      category,
      duration,
      image,
      moodTag,
    });

    res.status(201).json(challenge);
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update challenge
export const updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, duration, image, moodTag } = req.body;

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        duration,
        image,
        moodTag,
      },
      { new: true }
    );

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.status(200).json({
      message: "Challenge updated successfully",
      challenge,
    });
  } catch (error) {
    console.error("Update challenge error:", error);
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

    const alreadyCompleted = await CompletedChallenge.findOne({
      user: req.user._id,
      challenge: id,
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    const completion = new CompletedChallenge({
      user: req.user._id,
      challenge: id,
    });

    await completion.save();

    res.status(201).json({ message: "Challenge completed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get challenges by mood tag
export const getChallengesByMoodTag = async (req, res) => {
  try {
    const { moodTag } = req.params;
    
    // Find challenges that have this mood tag in their moodTag array
    const challenges = await Challenge.find({ 
      moodTag: { $in: [moodTag] } 
    });
    
    res.status(200).json(challenges);
  } catch (error) {
    console.error("Error fetching challenges by mood:", error);
    res.status(500).json({ message: error.message });
  }
};