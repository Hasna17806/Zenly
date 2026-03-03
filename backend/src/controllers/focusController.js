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
      duration,
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 📥 Get User Focus Sessions
export const getFocusSessions = async (req, res) => {
  try {
    const sessions = await FocusSession.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(sessions);
  } catch (error) {
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

    res.json({ message: "Session removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};