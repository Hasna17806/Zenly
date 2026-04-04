import Psychiatrist from "../models/Psychiatrist.js";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";

const cleanDoctorName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

/* USER REQUEST APPOINTMENT */

export const bookAppointment = async (req, res) => {
  try {
    const { psychiatristId } = req.body;

    const existing = await Appointment.findOne({
      userId: req.user._id,
      psychiatristId,
      status: "Pending"
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have a pending request with this psychiatrist"
      });
    }

    const psychiatrist = await Psychiatrist.findById(psychiatristId);

    if (!psychiatrist) {
      return res.status(404).json({
        message: "Psychiatrist not found"
      });
    }

    const doctorName = cleanDoctorName(psychiatrist.name);

    const appointment = new Appointment({
      userId: req.user._id,
      psychiatristId
    });

    await appointment.save();

    res.status(201).json({
      message: "Appointment request sent",
      appointment
    });

  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


/* PSYCHIATRIST VIEW APPOINTMENTS */

export const getPsychiatristAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      psychiatristId: req.psychiatrist._id
    })
      .populate("userId", "name currentMood")
      .sort({ createdAt: -1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* PSYCHIATRIST ACCEPT APPOINTMENT */

export const acceptAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        message: "Date and time are required"
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // Check if appointment is already accepted
    if (appointment.status === "Accepted") {
      return res.status(400).json({
        message: "Appointment already accepted"
      });
    }

    // Check if appointment is rejected
    if (appointment.status === "Rejected") {
      return res.status(400).json({
        message: "Cannot accept a rejected appointment"
      });
    }

    const psychiatrist = await Psychiatrist.findById(appointment.psychiatristId);

    if (!psychiatrist) {
      return res.status(404).json({
        message: "Psychiatrist not found"
      });
    }

    const doctorName = cleanDoctorName(psychiatrist.name);

    appointment.date = date;
    appointment.time = time;
    appointment.status = "Accepted";

    await appointment.save();

    // ✅ KEEP - Notification for accepted appointment
    await Notification.create({
      userId: appointment.userId,
      title: "Appointment Accepted",
      message: `Dr. ${doctorName} accepted your request for ${date} at ${time}.`,
      type: "appointment"
    });

    res.json({
      message: "Appointment confirmed",
      appointment
    });

  } catch (error) {
    console.error("ACCEPT APPOINTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* PSYCHIATRIST REJECT APPOINTMENT */

export const rejectAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    // Check if appointment is already accepted
    if (appointment.status === "Accepted") {
      return res.status(400).json({
        message: "Cannot reject an already accepted appointment"
      });
    }

    // Check if appointment is already rejected
    if (appointment.status === "Rejected") {
      return res.status(400).json({
        message: "Appointment already rejected"
      });
    }

    const psychiatrist = await Psychiatrist.findById(appointment.psychiatristId);

    if (!psychiatrist) {
      return res.status(404).json({
        message: "Psychiatrist not found"
      });
    }

    const doctorName = cleanDoctorName(psychiatrist.name);

    appointment.status = "Rejected";

    await appointment.save();

    // ✅ KEEP - Notification for rejected appointment
    await Notification.create({
      userId: appointment.userId,
      title: "Appointment Rejected",
      message: `Dr. ${doctorName} rejected your appointment request.`,
      type: "appointment"
    });

    res.json({
      message: "Appointment rejected"
    });

  } catch (error) {
    console.error("REJECT APPOINTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* USER VIEW THEIR APPOINTMENTS */

export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      userId: req.user._id
    })
      .populate("psychiatristId", "name specialization")
      .sort({ createdAt: -1 });

    res.json(appointments);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* USER CANCEL APPOINTMENT */

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (appointment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized"
      });
    }

    // Check if appointment is already accepted
    if (appointment.status === "Accepted") {
      return res.status(400).json({
        message: "Cannot cancel an accepted appointment. Please contact the psychiatrist directly."
      });
    }

    // Check if appointment is already rejected
    if (appointment.status === "Rejected") {
      return res.status(400).json({
        message: "Cannot cancel a rejected appointment"
      });
    }

    // Check if appointment is already cancelled
    if (appointment.status === "Cancelled") {
      return res.status(400).json({
        message: "Appointment already cancelled"
      });
    }

    const psychiatrist = await Psychiatrist.findById(appointment.psychiatristId);
    const doctorName = psychiatrist ? cleanDoctorName(psychiatrist.name) : "your psychiatrist";

    appointment.status = "Cancelled";
    await appointment.save();

    // ✅ KEEP - Notification for cancelled appointment
    await Notification.create({
      userId: req.user._id,
      title: "Appointment Cancelled",
      message: `Your appointment with Dr. ${doctorName} has been cancelled successfully.`,
      type: "appointment"
    });

    res.json({
      message: "Appointment cancelled successfully"
    });

  } catch (error) {
    console.error("CANCEL APPOINTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

/* GET APPOINTMENT BY ID */
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("psychiatristId", "name specialization")
      .populate("userId", "name email");
    
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    
    // Check authorization
    if (appointment.userId._id.toString() !== req.user._id.toString() && 
        appointment.psychiatristId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};