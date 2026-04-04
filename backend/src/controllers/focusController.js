import FocusSession from "../models/FocusSession.js";

// ➕ Create Focus Session
export const createFocusSession = async (req, res) => {
  try {
    const { duration } = req.body;

    if (!duration) {
      return res.status(400).json({ message: "Duration is required" });
    }

    const session = await FocusSession.create({
      user: req.user._id,
      duration: duration,
    });

    const response = {
      ...session.toObject(),
      durationMinutes: Math.round(duration / 60)
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating focus session:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📥 Get User Focus Sessions
export const getFocusSessions = async (req, res) => {
  try {
    const sessions = await FocusSession.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    const sessionsWithMinutes = sessions.map(session => ({
      ...session.toObject(),
      durationMinutes: Math.round(session.duration / 60)
    }));

    res.json(sessionsWithMinutes);
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    res.status(500).json({ message: error.message });
  }
};

// ❌ Delete Focus Session
export const deleteFocusSession = async (req, res) => {
  try {
    const session = await FocusSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await session.deleteOne();

    res.json({ message: "Session removed successfully" });
  } catch (error) {
    console.error("Error deleting focus session:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📊 Get Total Focus Time (Optional helper)
export const getTotalFocusTime = async (req, res) => {
  try {
    const result = await FocusSession.aggregate([
      { $match: { user: req.user._id } },
      { 
        $group: { 
          _id: null, 
          totalSeconds: { $sum: "$duration" },
          sessionCount: { $sum: 1 }
        }
      }
    ]);

    const totalSeconds = result.length > 0 ? result[0].totalSeconds : 0;
    const sessionCount = result.length > 0 ? result[0].sessionCount : 0;
    const totalMinutes = Math.round(totalSeconds / 60);

    res.json({
      totalSeconds,
      totalMinutes,
      sessionCount,
      formatted: totalMinutes >= 60 
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` 
        : `${totalMinutes}m`
    });
  } catch (error) {
    console.error("Error calculating total focus time:", error);
    res.status(500).json({ message: error.message });
  }
};