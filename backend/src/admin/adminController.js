import Admin from "./Admin.js";
import User from "../models/User.js";
import Psychiatrist from "../models/Psychiatrist.js";
import MoodLog from "../models/MoodLog.js";
import FocusSession from "../models/FocusSession.js";
import CompletedChallenge from "../models/CompletedChallenge.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import PsychiatristReview from "../models/PsychiatristReview.js";

/* ===============================
   ADMIN LOGIN
================================= */
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Admin login successful",
      token,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   DASHBOARD STATS
================================= */
export const getDashboardStats = async (req, res) => {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const endYesterday = new Date(today);

    // Run all queries in parallel
    const [
      totalUsers,
      totalPsychiatrists,
      totalStudents,
      newUsersThisWeek,
      newPsychiatristsThisWeek,
      focusHoursToday,
      focusHoursYesterday,
      moodLogsToday,
      moodLogsYesterday,
      challengesCompleted,
      challengesCompletedYesterday
    ] = await Promise.all([
      User.countDocuments(),
      Psychiatrist.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      Psychiatrist.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
      
      // Focus hours today - using completedAt instead of createdAt
      FocusSession.aggregate([
        { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
        { $group: { _id: null, total: { $sum: "$duration" } } }
      ]),
      
      // Focus hours yesterday
      FocusSession.aggregate([
        { $match: { createdAt: { $gte: yesterday, $lt: endYesterday } } },
        { $group: { _id: null, total: { $sum: "$duration" } } }
      ]),
      
      // Mood logs today
      MoodLog.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      
      // Mood logs yesterday
      MoodLog.countDocuments({ createdAt: { $gte: yesterday, $lt: endYesterday } }),
      
      // Challenges completed today 
      CompletedChallenge.countDocuments({ completedAt: { $gte: today, $lt: tomorrow } }),
      
      // Challenges completed yesterday
      CompletedChallenge.countDocuments({ completedAt: { $gte: yesterday, $lt: endYesterday } })
    ]);

    // Calculate changes
    const focusHoursTodayValue = focusHoursToday[0]?.total || 0;
    const focusHoursYesterdayValue = focusHoursYesterday[0]?.total || 0;
    const focusChange = focusHoursYesterdayValue > 0 
      ? Math.round(((focusHoursTodayValue - focusHoursYesterdayValue) / focusHoursYesterdayValue) * 100)
      : 0;

    const moodChange = moodLogsYesterday > 0
      ? Math.round(((moodLogsToday - moodLogsYesterday) / moodLogsYesterday) * 100)
      : 0;

    const challengeChange = challengesCompletedYesterday > 0
      ? Math.round(((challengesCompleted - challengesCompletedYesterday) / challengesCompletedYesterday) * 100)
      : 0;

    res.json({
      totalUsers,
      totalPsychiatrists,
      totalStudents,
      newUsers: newUsersThisWeek,
      newPsychiatrists: newPsychiatristsThisWeek,
      focusHoursToday: focusHoursTodayValue,
      focusChange,
      moodLogsToday,
      moodChange,
      challengesCompleted,
      challengeChange
    });

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   USER MANAGEMENT
================================= */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "student" }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: !user.isBlocked },
      { new: true }
    ).select("-password");

    res.json({
      message: `User ${updatedUser.isBlocked ? "blocked" : "unblocked"} successfully`,
      user: updatedUser
    });

  } catch (error) {
    console.error("Block error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Also delete related data
    await Promise.all([
      MoodLog.deleteMany({ user: user._id }),
      FocusSession.deleteMany({ user: user._id }),
      CompletedChallenge.deleteMany({ user: user._id })
    ]);

    res.json({ message: "User and all related data deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   PSYCHIATRIST MANAGEMENT (using Psychiatrist model)
================================= */

export const createPsychiatrist = async (req, res) => {

  try {

    const { name, email, password, specialization, consultationFee } = req.body;

    const psychiatrist = await User.create({
      name,
      email,
      password,
      specialization,
      consultationFee,
      role: "psychiatrist"
    });

    res.status(201).json(psychiatrist);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }

};

export const getPsychiatrists = async (req, res) => {
  try {

   const psychiatrists = await User.find({
      $or: [
        { role: "psychiatrist" },
        { specialization: { $exists: true } }
      ]
    }).select("-password");

    res.json(psychiatrists);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPsychiatristById = async (req, res) => {
  try {
    const psychiatrist = await Psychiatrist.findById(req.params.id)
      .select("-password");

    if (!psychiatrist) {
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    // Get additional stats - sessions they've conducted
    const totalSessions = await FocusSession.countDocuments({ 
      psychiatrist: psychiatrist._id 
    });

    res.json({
      ...psychiatrist.toObject(),
      stats: {
        totalSessions,
        totalEarnings: psychiatrist.commissionDue || 0
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const blockPsychiatrist = async (req, res) => {

  const psychiatrist = await User.findById(req.params.id);

  psychiatrist.isBlocked = !psychiatrist.isBlocked;

  await psychiatrist.save();

  res.json({ message: "Psychiatrist status updated" });

};

export const updatePsychiatrist = async (req, res) => {
  try {
    const { name, specialization, consultationFee } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (specialization) updateData.specialization = specialization;
    if (consultationFee !== undefined) updateData.consultationFee = consultationFee;

    const psychiatrist = await Psychiatrist.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!psychiatrist) {
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    res.json({
      message: "Psychiatrist updated successfully",
      psychiatrist
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletePsychiatrist = async (req, res) => {
  try {
    const psychiatrist = await Psychiatrist.findByIdAndDelete(req.params.id);

    if (!psychiatrist) {
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    // Update any users who had this psychiatrist selected
    await User.updateMany(
      { selectedPsychiatrists: psychiatrist._id },
      { $pull: { selectedPsychiatrists: psychiatrist._id } }
    );

    res.json({ message: "Psychiatrist deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   USER COUNT
================================= */
export const getUserCount = async (req, res) => {
  try {
    const [total, students, psychiatrists] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      Psychiatrist.countDocuments()
    ]);

    res.json({ 
      totalUsers: total,
      totalStudents: students,
      totalPsychiatrists: psychiatrists
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   WEEKLY FOCUS STATS (Now in Minutes)
================================= */
export const getWeeklyFocusStats = async (req, res) => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const stats = await FocusSession.aggregate([
        {
          $match: {
            createdAt: { $gte: date, $lt: nextDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$duration" }
          }
        }
      ]);

      // Convert seconds to minutes
      const totalMinutes = stats[0]?.total ? Math.round(stats[0].total / 60) : 0;

      result.unshift({
        day: days[date.getDay()],
        minutes: totalMinutes  // Now in minutes
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Error in getWeeklyFocusStats:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   USER GROWTH STATS
================================= */
export const getUserGrowthStats = async (req, res) => {
  try {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $lt: nextDate }
      });

      result.push({
        day: days[date.getDay()],
        users: count
      });
    }

    res.json(result);

  } catch (error) {
    console.error('Error in getUserGrowthStats:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   MOOD DISTRIBUTION
================================= */
export const getMoodDistribution = async (req, res) => {
  try {
    const moodStats = await MoodLog.aggregate([
      {
        $group: {
          _id: "$mood",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Format mood names
    const formattedMoods = moodStats.map(item => ({
      name: item._id.split('/')[0] || item._id,
      value: item.count
    }));

    res.json(formattedMoods);

  } catch (error) {
    console.error('Error in getMoodDistribution:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   RECENT ACTIVITY
================================= */
export const getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // Get recent mood logs
    const recentMoods = await MoodLog.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('user', 'name');

    recentMoods.forEach(mood => {
      activities.push({
        emoji: '🟢',
        user: mood.user?.name || 'Unknown',
        action: `logged their mood: ${mood.mood}`,
        time: formatTimeAgo(mood.createdAt),
        timestamp: mood.createdAt
      });
    });

    // Get recent focus sessions
    const recentFocus = await FocusSession.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('user', 'name');

    recentFocus.forEach(session => {
      const hours = Math.floor(session.duration / 3600);
      const minutes = Math.floor((session.duration % 3600) / 60);
      const timeString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      
      activities.push({
        emoji: '🔵',
        user: session.user?.name || 'Unknown',
        action: `completed ${timeString} focus session`,
        time: formatTimeAgo(session.createdAt),
        timestamp: session.createdAt
      });
    });

    // Get recent challenge completions - FIX THIS PART
    const recentChallenges = await CompletedChallenge.find()
      .sort({ completedAt: -1 })
      .limit(5)
      .populate('user', 'name');

    recentChallenges.forEach(challenge => {
      activities.push({
        emoji: '🏆',
        user: challenge.user?.name || 'Unknown',
        action: `completed a challenge`,
        time: formatTimeAgo(challenge.completedAt),
        timestamp: challenge.completedAt
      });
    });

    // Get recent user registrations
    const recentUsers = await User.find({ role: "student" })
      .sort({ createdAt: -1 })
      .limit(2)
      .select('name createdAt');

    recentUsers.forEach(user => {
      activities.push({
        emoji: '👤',
        user: 'System',
        action: `new user registered: ${user.name}`,
        time: formatTimeAgo(user.createdAt),
        timestamp: user.createdAt
      });
    });

    // Sort by timestamp and limit to 5
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(activities.slice(0, 5));

  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   USER ACTIVITY DETAILS
================================= */
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 📊 Focus Stats - Convert to minutes
    const totalFocusSessions = await FocusSession.countDocuments({ user: userId });

    const totalFocusMinutesData = await FocusSession.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: null, totalSeconds: { $sum: "$duration" } } }
    ]);

    const totalFocusMinutes =
      totalFocusMinutesData.length > 0
        ? Math.round(totalFocusMinutesData[0].totalSeconds / 60)
        : 0;

    // 😊 Mood Stats
    const totalMoodEntries = await MoodLog.countDocuments({ user: userId });

    const moodDistribution = await MoodLog.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: "$mood", count: { $sum: 1 } } }
    ]);

    // 📅 Recent Activity (last 5 focus sessions) - Convert to minutes
    const recentFocus = await FocusSession.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Convert recent focus sessions to minutes
    const recentFocusInMinutes = recentFocus.map(session => ({
      ...session.toObject(),
      durationMinutes: Math.round(session.duration / 60)
    }));

    // For psychiatrists, get their students
    let selectedByStudents = [];
    if (user.role === 'psychiatrist') {
      selectedByStudents = await User.find({ 
        selectedPsychiatrists: user._id 
      }).select('name email');
    }

    res.json({
      user,
      stats: {
        totalFocusSessions,
        totalFocusMinutes,
        totalMoodEntries,
        moodDistribution,
        recentFocus: recentFocusInMinutes,
      },
      additionalInfo: {
        selectedByStudents: user.role === 'psychiatrist' ? selectedByStudents : undefined,
        commissionDue: user.role === 'psychiatrist' ? user.commissionDue : undefined,
        warningLevel: user.warningLevel,
        problem: user.problem,
        currentMood: user.currentMood,
      }
    });

  } catch (error) {
    console.error("Activity error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ===============================
   HELPER FUNCTIONS
================================= */
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffMinutes = Math.floor((now - new Date(date)) / 60000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return `${Math.floor(diffDays / 7)}w ago`;
};

export const getAllPsychiatristReviews = async (req, res) => {
  try {
    const reviews = await PsychiatristReview.find()
      .populate("user", "name email")
      .populate("psychiatrist", "name specialization email")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Admin review fetch error:", error);
    res.status(500).json({ message: error.message });
  }
};