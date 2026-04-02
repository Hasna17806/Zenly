import FocusSession from "../models/FocusSession.js";

// ➕ Create Focus Session
export const createFocusSession = async (req, res) => {
  try {
    const { duration } = req.body;
    console.log("=== CREATE FOCUS SESSION ===");
    console.log("Received duration (seconds):", duration);
    console.log("User ID:", req.user?._id);

    if (!duration) {
      console.log("Error: Duration is missing");
      return res.status(400).json({ message: "Duration is required" });
    }

    // Validate duration is a positive number
    if (typeof duration !== 'number' || duration <= 0) {
      console.log("Error: Invalid duration value:", duration);
      return res.status(400).json({ 
        message: "Duration must be a positive number",
        received: duration
      });
    }

    const session = await FocusSession.create({
      user: req.user._id,
      duration: duration, 
    });

    console.log("Session created successfully:", {
      id: session._id,
      user: session.user,
      duration: session.duration,
      durationMinutes: Math.round(duration / 60)
    });

    // Return response with minutes for frontend
    const response = {
      ...session.toObject(),
      durationMinutes: Math.round(duration / 60)
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating focus session:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: "Failed to save focus session",
      error: error.message 
    });
  }
};

// 📥 Get User Focus Sessions
export const getFocusSessions = async (req, res) => {
  try {
    console.log("=== GET FOCUS SESSIONS ===");
    console.log("User ID:", req.user?._id);

    const sessions = await FocusSession.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    console.log(`Found ${sessions.length} sessions`);

    // Convert to minutes for frontend
    const sessionsWithMinutes = sessions.map(session => {
      const minutes = Math.round(session.duration / 60);
      console.log(`Session ${session._id}: ${session.duration} seconds = ${minutes} minutes`);
      return {
        ...session.toObject(),
        durationMinutes: minutes,
        durationSeconds: session.duration
      };
    });

    res.json(sessionsWithMinutes);
  } catch (error) {
    console.error("Error fetching focus sessions:", error);
    res.status(500).json({ 
      message: "Failed to fetch focus sessions",
      error: error.message 
    });
  }
};

// ❌ Delete Focus Session
export const deleteFocusSession = async (req, res) => {
  try {
    console.log("=== DELETE FOCUS SESSION ===");
    console.log("Session ID:", req.params.id);
    console.log("User ID:", req.user?._id);

    const session = await FocusSession.findById(req.params.id);

    if (!session) {
      console.log("Session not found");
      return res.status(404).json({ message: "Session not found" });
    }

    console.log("Found session:", {
      id: session._id,
      user: session.user,
      duration: session.duration
    });

    if (session.user.toString() !== req.user._id.toString()) {
      console.log("Unauthorized: User mismatch");
      return res.status(401).json({ message: "Not authorized" });
    }

    await session.deleteOne();
    console.log("Session deleted successfully");

    res.json({ message: "Session removed successfully" });
  } catch (error) {
    console.error("Error deleting focus session:", error);
    res.status(500).json({ 
      message: "Failed to delete session",
      error: error.message 
    });
  }
};

// 📊 Get Total Focus Time for User
export const getTotalFocusTime = async (req, res) => {
  try {
    console.log("=== GET TOTAL FOCUS TIME ===");
    console.log("User ID:", req.user?._id);

    const result = await FocusSession.aggregate([
      { $match: { user: req.user._id } },
      { $group: { 
        _id: null, 
        totalSeconds: { $sum: "$duration" },
        sessionCount: { $sum: 1 }
      }}
    ]);

    const totalSeconds = result.length > 0 ? result[0].totalSeconds : 0;
    const sessionCount = result.length > 0 ? result[0].sessionCount : 0;
    const totalMinutes = Math.round(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    console.log("Total focus time:", {
      totalSeconds,
      totalMinutes,
      totalHours,
      remainingMinutes,
      sessionCount
    });

    res.json({
      totalSeconds,
      totalMinutes,
      totalHours,
      remainingMinutes,
      sessionCount,
      formatted: totalHours > 0 
        ? `${totalHours}h ${remainingMinutes}m` 
        : `${totalMinutes}m`
    });
  } catch (error) {
    console.error("Error calculating total focus time:", error);
    res.status(500).json({ 
      message: "Failed to calculate total focus time",
      error: error.message 
    });
  }
};