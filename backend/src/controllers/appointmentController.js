import Psychiatrist from "../models/Psychiatrist.js";
import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import Availability from "../models/Availability.js"; // ⭐ ADD THIS IMPORT

const cleanDoctorName = (name = "") => name.replace(/^Dr\.?\s*/i, "").trim();

/* USER REQUEST APPOINTMENT */

export const bookAppointment = async (req, res) => {
  try {
    const { psychiatristId, preferredDate, preferredTime } = req.body;

    const existing = await Appointment.findOne({
      userId: req.user._id,
      psychiatristId,
      status: { $in: ["Pending", "Accepted"] }
    });

    if (existing) {
      return res.status(400).json({
        message: "You already have an active appointment with this psychiatrist"
      });
    }

    const psychiatrist = await Psychiatrist.findById(psychiatristId);

    if (!psychiatrist) {
      return res.status(404).json({
        message: "Psychiatrist not found"
      });
    }

    const appointment = new Appointment({
      userId: req.user._id,
      psychiatristId,
      date: preferredDate || null,
      time: preferredTime || null
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
    const appointmentId = req.params.id;

    if (!date || !time) {
      return res.status(400).json({
        message: "Date and time are required"
      });
    }

    const appointment = await Appointment.findById(appointmentId);

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

    // ⭐⭐⭐ BOOK THE SLOT IN AVAILABILITY ⭐⭐⭐
    try {
      const availability = await Availability.findOne({
        psychiatristId: appointment.psychiatristId,
        date: date
      });

      if (availability) {
        const slot = availability.slots.find(s => s.time === time);
        if (slot) {
          if (slot.isBooked) {
            return res.status(400).json({
              message: "This time slot is already booked by another patient"
            });
          }
          slot.isBooked = true;
          slot.bookedBy = appointment.userId;
          slot.appointmentId = appointmentId;
          await availability.save();
          console.log(`✅ Slot ${time} on ${date} booked for appointment ${appointmentId}`);
        } else {
          console.log(`⚠️ Slot ${time} not found in availability for ${date}`);
        }
      } else {
        console.log(`⚠️ No availability found for date ${date}`);
      }
    } catch (slotError) {
      console.error("Error booking slot:", slotError);
      // Don't block appointment acceptance if slot booking fails
    }

    const doctorName = cleanDoctorName(psychiatrist.name);

    appointment.date = date;
    appointment.time = time;
    appointment.status = "Accepted";

    await appointment.save();

    // Notification for accepted appointment
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

    // ⭐ RELEASE THE SLOT IF IT WAS BOOKED ⭐
    if (appointment.date && appointment.time) {
      try {
        const availability = await Availability.findOne({
          psychiatristId: appointment.psychiatristId,
          date: appointment.date
        });
        
        if (availability) {
          const slot = availability.slots.find(s => s.time === appointment.time);
          if (slot && slot.isBooked && slot.appointmentId?.toString() === appointment._id.toString()) {
            slot.isBooked = false;
            slot.bookedBy = null;
            slot.appointmentId = null;
            await availability.save();
            console.log(`✅ Slot ${appointment.time} on ${appointment.date} released`);
          }
        }
      } catch (slotError) {
        console.error("Error releasing slot:", slotError);
      }
    }

    const doctorName = cleanDoctorName(psychiatrist.name);

    appointment.status = "Rejected";
    await appointment.save();

    // Notification for rejected appointment
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

    // ⭐ RELEASE THE SLOT IF IT WAS BOOKED ⭐
    if (appointment.date && appointment.time) {
      try {
        const availability = await Availability.findOne({
          psychiatristId: appointment.psychiatristId,
          date: appointment.date
        });
        
        if (availability) {
          const slot = availability.slots.find(s => s.time === appointment.time);
          if (slot && slot.isBooked && slot.appointmentId?.toString() === appointment._id.toString()) {
            slot.isBooked = false;
            slot.bookedBy = null;
            slot.appointmentId = null;
            await availability.save();
            console.log(`✅ Slot ${appointment.time} on ${appointment.date} released on cancellation`);
          }
        }
      } catch (slotError) {
        console.error("Error releasing slot on cancel:", slotError);
      }
    }

    appointment.status = "Cancelled";
    await appointment.save();

    // Notification for cancelled appointment
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