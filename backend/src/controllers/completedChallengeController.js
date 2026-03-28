import CompletedChallenge from "../models/CompletedChallenge.js";

// mark challenge as completed
export const completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.body;

    const alreadyCompleted = await CompletedChallenge.findOne({
      user: req.user._id,
      challengeId,
    });

    if (alreadyCompleted) {
      return res.status(400).json({ message: "Challenge already completed" });
    }

    const completion = new CompletedChallenge({
      user: req.user._id,
      challengeId,
    });

    await completion.save();

    res.status(201).json({ message: "Challenge completed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// get completed challenges
export const getCompletedChallenges = async (req, res) => {
  try {

    const completed = await CompletedChallenge.find({
      user: req.user._id,
    });

    res.json(completed);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};