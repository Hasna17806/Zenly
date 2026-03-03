import MoodLog from "../models/MoodLog.js";
import Challenge from "../models/Challenge.js";

// ✅ CREATE MOOD
export const createMoodLog = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    const { mood, note } = req.body;

    const moodLog = await MoodLog.create({
      user: req.user._id,
      mood,
      note,
    });

    // 🎯 Fetch suggested challenges
    const challenges = await Challenge.find({ moodTag: mood });

    res.status(201).json({
      moodLog,
      suggestedChallenges: challenges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL MOODS (for logged-in user)
export const getMoodLogs = async (req, res) => {
  try {
    const moods = await MoodLog.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(moods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE MOOD
export const deleteMoodLog = async (req, res) => {
  try {
    const mood = await MoodLog.findById(req.params.id);

    if (!mood) {
      return res.status(404).json({ message: "Mood not found" });
    }

    // security check 
    if (mood.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await mood.deleteOne();

    res.json({ message: "Mood deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};