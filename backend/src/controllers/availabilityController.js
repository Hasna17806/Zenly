import Availability from "../models/Availability.js";

// Get all availabilities for a psychiatrist (for their management page)
export const getPsychiatristAvailabilities = async (req, res) => {
  try {
    const availabilities = await Availability.find({
      psychiatristId: req.psychiatrist._id
    }).sort({ date: 1 });
    
    res.json(availabilities);
  } catch (error) {
    console.error("Error fetching psychiatrist availabilities:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get available slots for a psychiatrist on a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const { psychiatristId, date } = req.params;
    
    
    let availability = await Availability.findOne({
      psychiatristId,
      date
    });
    
    if (!availability) {
      return res.json([]);
    }
    
    // Return only available (not booked) slots
    const availableSlots = availability.slots.filter(slot => !slot.isBooked);
    res.json(availableSlots);
    
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get all available dates for a psychiatrist (next 30 days)
export const getAvailableDates = async (req, res) => {
  try {
    const { psychiatristId } = req.params;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const availabilities = await Availability.find({
      psychiatristId,
      date: { $gte: startDateStr, $lte: endDateStr }
    });
    
    const availableDates = availabilities
      .filter(avail => avail.slots.some(slot => !slot.isBooked))
      .map(avail => avail.date);
    
    res.json(availableDates);
    
  } catch (error) {
    console.error("Error fetching available dates:", error);
    res.status(500).json({ message: error.message });
  }
};

// Psychiatrist: Add availability slots
export const addAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const psychiatristId = req.psychiatrist._id;
    
    console.log("Adding availability:", { psychiatristId, date, slots });
    
    let availability = await Availability.findOne({
      psychiatristId,
      date
    });
    
    if (availability) {
      // Merge new slots with existing ones (avoid duplicates)
      const existingTimes = new Set(availability.slots.map(s => s.time));
      const newSlots = slots.filter(s => !existingTimes.has(s)).map(time => ({ time, isBooked: false }));
      availability.slots.push(...newSlots);
      await availability.save();
      res.json({ message: "Availability updated successfully", availability });
    } else {
      availability = await Availability.create({
        psychiatristId,
        date,
        slots: slots.map(time => ({ time, isBooked: false }))
      });
      res.json({ message: "Availability added successfully", availability });
    }
    
  } catch (error) {
    console.error("Error adding availability:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete availability
export const deleteAvailability = async (req, res) => {
  try {
    const availability = await Availability.findOneAndDelete({
      _id: req.params.id,
      psychiatristId: req.psychiatrist._id
    });
    
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    
    res.json({ message: "Availability deleted successfully" });
  } catch (error) {
    console.error("Error deleting availability:", error);
    res.status(500).json({ message: error.message });
  }
};

// Book a slot (called when appointment is accepted)
export const bookSlot = async (req, res) => {
  try {
    const { psychiatristId, date, time, userId } = req.body;
    
    const availability = await Availability.findOne({
      psychiatristId,
      date
    });
    
    if (!availability) {
      return res.status(404).json({ message: "No availability found for this date" });
    }
    
    const slot = availability.slots.find(s => s.time === time);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }
    
    if (slot.isBooked) {
      return res.status(400).json({ message: "Slot already booked" });
    }
    
    slot.isBooked = true;
    slot.bookedBy = userId;
    await availability.save();
    
    res.json({ message: "Slot booked successfully" });
  } catch (error) {
    console.error("Error booking slot:", error);
    res.status(500).json({ message: error.message });
  }
};