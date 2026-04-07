import ChatMessage from "../models/ChatMessage.js";

/* SEND MESSAGE */
export const sendMessage = async (req, res) => {
  try {
    const { appointmentId, message } = req.body;

    if (!appointmentId || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "Appointment ID and message are required" });
    }

    let senderRole = "student";
    let senderId = null;

    if (req.psychiatrist) {
      senderRole = "psychiatrist";
      senderId = req.psychiatrist._id;
      console.log("Sending as psychiatrist:", senderId);
    } else if (req.user) {
      senderId = req.user._id;
      senderRole = req.user.role === "psychiatrist" ? "psychiatrist" : "student";
      console.log("Sending as user:", senderId, "Role:", senderRole);
    } else {
      return res.status(401).json({ message: "Unauthorized - No user found" });
    }

    const chat = await ChatMessage.create({
      appointmentId,
      senderId,
      senderRole,
      message: message.trim(),
    });

    console.log("Message saved successfully:", chat._id);
    res.status(201).json(chat);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* GET CHAT HISTORY */
export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      appointmentId: req.params.id,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: error.message });
  }
};