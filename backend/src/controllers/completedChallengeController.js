import mongoose from "mongoose";
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
    const { title, description, category, duration, image, moodTag, gameType } = req.body;

    const challenge = await Challenge.create({
      title,
      description,
      category,
      duration,
      image,
      moodTag,
      gameType,
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
    const { title, description, category, duration, image, moodTag, gameType } = req.body;

    const challenge = await Challenge.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category,
        duration,
        image,
        moodTag,
        gameType,
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

// Get completed challenges
export const getCompletedChallenges = async (req, res) => {
  try {
    const completed = await CompletedChallenge.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(completed);
  } catch (error) {
    console.error("Get completed challenges error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Complete challenge
export const completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({ message: "Challenge ID is required" });
    }

    const alreadyCompleted = await CompletedChallenge.findOne({
      user: req.user._id,
      challengeId: String(challengeId),
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    const completion = new CompletedChallenge({
      user: req.user._id,
      challengeId: String(challengeId),
      completedAt: new Date(),
    });

    await completion.save();

    res.status(201).json({
      message: "Challenge completed successfully",
      completion,
    });
  } catch (error) {
    console.error("Complete challenge error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user progress
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id;

    const completed = await CompletedChallenge.find({ user: userId });

    const total = completed.length;

    const today = new Date();
    const todayCount = completed.filter((c) => {
      const d = new Date(c.completedAt || c.createdAt);
      return d.toDateString() === today.toDateString();
    }).length;

    res.json({
      total,
      today: todayCount,
      completed,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// import Challenge from "../models/Challenge.js";
// import CompletedChallenge from "../models/CompletedChallenge.js";

// // Get all challenges
// export const getAllChallenges = async (req, res) => {
//   try {
//     const challenges = await Challenge.find().sort({ createdAt: -1 });
//     res.status(200).json(challenges);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get challenges by category
// export const getChallengesByMood = async (req, res) => {
//   try {
//     const { category } = req.params;
//     const challenges = await Challenge.find({ category }).sort({ createdAt: -1 });
//     res.status(200).json(challenges);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Create challenge
// export const createChallenge = async (req, res) => {
//   try {
//     const { title, description, category, duration, image, moodTag, gameType } = req.body;

//     const challenge = await Challenge.create({
//       title,
//       description,
//       category,
//       duration,
//       image,
//       moodTag,
//       gameType,
//     });

//     res.status(201).json(challenge);
//   } catch (error) {
//     console.error("Create challenge error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update challenge
// export const updateChallenge = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, category, duration, image, moodTag, gameType } = req.body;

//     const challenge = await Challenge.findByIdAndUpdate(
//       id,
//       {
//         title,
//         description,
//         category,
//         duration,
//         image,
//         moodTag,
//         gameType,
//       },
//       { new: true }
//     );

//     if (!challenge) {
//       return res.status(404).json({ message: "Challenge not found" });
//     }

//     res.status(200).json({
//       message: "Challenge updated successfully",
//       challenge,
//     });
//   } catch (error) {
//     console.error("Update challenge error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Delete challenge
// export const deleteChallenge = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const challenge = await Challenge.findByIdAndDelete(id);

//     if (!challenge) {
//       return res.status(404).json({ message: "Challenge not found" });
//     }

//     res.status(200).json({ message: "Challenge deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get completed challenges for logged in user
// export const getCompletedChallenges = async (req, res) => {
//   try {
//     const completed = await CompletedChallenge.find({
//       user: req.user._id,
//     }).sort({ createdAt: -1 });

//     res.status(200).json(completed);
//   } catch (error) {
//     console.error("Get completed challenges error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Complete challenge
// export const completeChallenge = async (req, res) => {
//   try {
//     const { challengeId } = req.body;

//     if (!challengeId) {
//       return res.status(400).json({ message: "Challenge ID is required" });
//     }

//     // Make sure challenge actually exists in DB
//     const challengeExists = await Challenge.findById(challengeId);

//     if (!challengeExists) {
//       return res.status(404).json({
//         message: "Challenge not found in database. Please add it from admin first.",
//       });
//     }

//     // Check if already completed
//     const alreadyCompleted = await CompletedChallenge.findOne({
//       user: req.user._id,
//       challengeId,
//     });

//     if (alreadyCompleted) {
//       return res.status(400).json({ message: "Challenge already completed" });
//     }

//     const completion = new CompletedChallenge({
//       user: req.user._id,
//       challengeId,
//       completedAt: new Date(),
//     });

//     await completion.save();

//     res.status(201).json({
//       message: "Challenge completed successfully",
//       completion,
//     });
//   } catch (error) {
//     console.error("Complete challenge error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getUserProgress = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const completed = await CompletedChallenge.find({ user: userId }).sort({
//       createdAt: -1,
//     });

//     const total = completed.length;

//     const today = new Date();
//     const todayCount = completed.filter((c) => {
//       const d = new Date(c.completedAt || c.createdAt);
//       return d.toDateString() === today.toDateString();
//     }).length;

//     res.json({
//       total,
//       today: todayCount,
//       completed,
//     });
//   } catch (error) {
//     console.error("Get user progress error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };