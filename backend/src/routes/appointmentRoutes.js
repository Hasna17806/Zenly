import express from "express";
import {
  bookAppointment,
  getPsychiatristAppointments,
  getUserAppointments
} from "../controllers/appointmentController.js";

import Appointment from "../models/Appointment.js";
import { protect } from "../middleware/authMiddleware.js";
import { protectPsychiatrist } from "../middleware/psychiatristAuth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.post("/book", protect, bookAppointment);

router.get("/psychiatrist", protectPsychiatrist, getPsychiatristAppointments);

router.get("/user", protect, getUserAppointments);

router.put("/accept/:id", protectPsychiatrist, async (req, res) => {

  try {

    const { date, time } = req.body;

    console.log("DATE:", date);
    console.log("TIME:", time);

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

    appointment.status = "Accepted";
    appointment.date = date;
    appointment.time = time;

    await appointment.save();

    await Notification.create({
    userId: appointment.userId,
    title: "Appointment Accepted",
    message: `Your appointment has been accepted for ${date} at ${time}.`,
    type: "appointment"
    });

    res.json(appointment);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

});

router.put("/reject/:id", protectPsychiatrist, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = "Rejected";
    await appointment.save();

    await Notification.create({
      userId: appointment.userId,
      title: "Appointment Rejected",
      message: "Your appointment request was rejected by the psychiatrist.",
      type: "appointment"
    });

    res.json(appointment);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* USER CANCEL APPOINTMENT */

router.delete("/cancel/:id", protect, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    await Notification.create({
      userId: req.user._id,
      title: "Appointment Cancelled",
      message: "You cancelled your appointment successfully.",
      type: "appointment"
    });

    res.json({ message: "Appointment cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;