import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import MoodLog from "../models/MoodLog.js";
import CompletedChallenge from "../models/CompletedChallenge.js";

// Get all patients for a psychiatrist
export const getPsychiatristPatients = async (req, res) => {
  try {
    const psychiatristId = req.psychiatrist._id;
    
    console.log("Fetching patients for psychiatrist:", psychiatristId);
    
    // Get all appointments for this psychiatrist
    const appointments = await Appointment.find({ 
      psychiatristId,
      status: { $in: ["Accepted", "Completed", "Pending"] }
    }).populate("userId", "name email");

    // Get unique patients
    const patientMap = new Map();
    
    for (const app of appointments) {
      const user = app.userId;
      if (!user) continue;
      
      if (!patientMap.has(user._id.toString())) {
        // Get mood history for this patient - FIXED: use MoodLog and 'user' field
        const moodHistory = await MoodLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(1);
        const currentMood = moodHistory[0]?.mood || null;
        
        // Count active appointments
        const activeAppointments = await Appointment.countDocuments({
          psychiatristId,
          userId: user._id,
          status: "Accepted"
        });
        
        // Count completed appointments
        const completedAppointments = await Appointment.countDocuments({
          psychiatristId,
          userId: user._id,
          status: "Completed"
        });
        
        // Get active appointment ID for messaging
        const activeAppointment = await Appointment.findOne({
          psychiatristId,
          userId: user._id,
          status: "Accepted"
        });
        
        patientMap.set(user._id.toString(), {
          _id: user._id,
          name: user.name,
          email: user.email,
          currentMood: currentMood,
          activeAppointments: activeAppointments,
          completedAppointments: completedAppointments,
          activeAppointmentId: activeAppointment?._id || null
        });
      }
    }
    
    console.log("Patients found:", patientMap.size);
    res.json(Array.from(patientMap.values()));
  } catch (error) {
    console.error("Error fetching psychiatrist patients:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get single patient details
export const getPatientDetails = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychiatristId = req.psychiatrist._id;
    
    // Verify that this patient has appointments with this psychiatrist
    const appointment = await Appointment.findOne({
      psychiatristId,
      userId: patientId
    });
    
    if (!appointment) {
      return res.status(403).json({ message: "Unauthorized to view this patient" });
    }
    
    const patient = await User.findById(patientId).select("-password");
    res.json(patient);
  } catch (error) {
    console.error("Error fetching patient details:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient appointments
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychiatristId = req.psychiatrist._id;
    
    const appointments = await Appointment.find({
      psychiatristId,
      userId: patientId
    }).sort({ createdAt: -1 });
    
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching patient appointments:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient mood history - FIXED: use MoodLog and 'user' field
export const getPatientMoodHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychiatristId = req.psychiatrist._id;
    
    // Verify access
    const appointment = await Appointment.findOne({
      psychiatristId,
      userId: patientId
    });
    
    if (!appointment) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const moodHistory = await MoodLog.find({ user: patientId }).sort({ createdAt: -1 });
    res.json(moodHistory);
  } catch (error) {
    console.error("Error fetching mood history:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get patient challenge progress - FIXED: use 'user' field
export const getPatientChallenges = async (req, res) => {
  try {
    const { patientId } = req.params;
    const psychiatristId = req.psychiatrist._id;
    
    // Verify access
    const appointment = await Appointment.findOne({
      psychiatristId,
      userId: patientId
    });
    
    if (!appointment) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const challenges = await CompletedChallenge.find({ user: patientId })
      .sort({ createdAt: -1 });
    
    const formattedChallenges = challenges.map(c => ({
      title: c.challengeId || "Challenge",
      description: "Completed a wellness challenge",
      completedAt: c.createdAt
    }));
    
    res.json(formattedChallenges);
  } catch (error) {
    console.error("Error fetching patient challenges:", error);
    res.status(500).json({ message: error.message });
  }
};