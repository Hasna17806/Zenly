import mongoose from "mongoose";
import Psychiatrist from "../models/Psychiatrist.js";

/* ---------------- GET ALL PSYCHIATRISTS ---------------- */
export const getPsychiatrists = async (req, res) => {
  try {
    const psychiatrists = await Psychiatrist.find();
    console.log("Psychiatrists from DB:", psychiatrists);
    res.json(psychiatrists);
  } catch (error) {
    console.error("Error fetching psychiatrists:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- CREATE PSYCHIATRIST ---------------- */
export const createPsychiatrist = async (req, res) => {
  try {
    const { name, email, password, specialization, consultationFee, phone } = req.body;

    // Check missing fields
    if (!name || !email || !password || !specialization || !consultationFee) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existingPsychiatrist = await Psychiatrist.findOne({ email });
    if (existingPsychiatrist) {
      return res.status(400).json({ message: "Psychiatrist already exists with this email" });
    }

    // Handle document uploads
    const documents = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push(`/uploads/documents/${file.filename}`);
      });
    }

    const psychiatrist = new Psychiatrist({
      name,
      email,
      password, 
      specialization,
      consultationFee: Number(consultationFee),
      phone: phone || "",
      documents
    });

    await psychiatrist.save();

    // Return without password
    const responseData = psychiatrist.toObject();
    delete responseData.password;

    res.status(201).json(responseData);

  } catch (error) {
    console.error("Error creating psychiatrist:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- UPDATE PSYCHIATRIST ---------------- */
export const updatePsychiatrist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, specialization, consultationFee, phone, existingDocuments } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid psychiatrist ID" });
    }

    const psychiatrist = await Psychiatrist.findById(id);
    if (!psychiatrist) {
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    if (email && email !== psychiatrist.email) {
      const existingPsychiatrist = await Psychiatrist.findOne({ email });
      if (existingPsychiatrist) {
        return res.status(400).json({ message: "Email already in use" });
      }
      psychiatrist.email = email;
    }

    // Update fields
    if (name) psychiatrist.name = name;
    if (specialization) psychiatrist.specialization = specialization;
    if (consultationFee) psychiatrist.consultationFee = Number(consultationFee);
    if (phone !== undefined) psychiatrist.phone = phone;

    // Handle documents
    let documents = [];
    
    // Parse existing documents if provided
    if (existingDocuments) {
      try {
        const existingDocs = JSON.parse(existingDocuments);
        documents = existingDocs;
      } catch (e) {
        console.error("Error parsing existingDocuments:", e);
      }
    }

    // Add new documents from upload
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        documents.push(`/uploads/documents/${file.filename}`);
      });
    }
    
    psychiatrist.documents = documents;

    await psychiatrist.save();

    // Return without password
    const responseData = psychiatrist.toObject();
    delete responseData.password;

    res.json({ 
      message: "Psychiatrist updated successfully", 
      psychiatrist: responseData 
    });

  } catch (error) {
    console.error("Error updating psychiatrist:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- BLOCK / UNBLOCK PSYCHIATRIST ---------------- */
export const blockPsychiatrist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error("Invalid psychiatrist ID:", id);
      return res.status(400).json({ message: "Invalid psychiatrist ID" });
    }

    const psychiatrist = await Psychiatrist.findById(id);

    if (!psychiatrist) {
      console.error("Psychiatrist not found:", id);
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    psychiatrist.isBlocked = !psychiatrist.isBlocked;
    await psychiatrist.save();

    console.log(`Psychiatrist ${id} blocked status toggled to:`, psychiatrist.isBlocked);
    res.json({ message: "Psychiatrist status updated", isBlocked: psychiatrist.isBlocked });

  } catch (error) {
    console.error("Error in blockPsychiatrist:", error);
    res.status(500).json({ message: "Failed to update psychiatrist status" });
  }
};

/* ---------------- DELETE PSYCHIATRIST ---------------- */
export const deletePsychiatrist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid psychiatrist ID" });
    }

    const psychiatrist = await Psychiatrist.findById(id);

    if (!psychiatrist) {
      return res.status(404).json({ message: "Psychiatrist not found" });
    }

    await Psychiatrist.findByIdAndDelete(id);

    res.json({ message: "Psychiatrist deleted successfully" });

  } catch (error) {
    console.error("Error deleting psychiatrist:", error);
    res.status(500).json({ message: error.message });
  }
};