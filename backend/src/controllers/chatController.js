import ChatMessage from "../models/ChatMessage.js";

/* SEND MESSAGE */

export const sendMessage = async (req, res) => {

  try {

    const { appointmentId, message } = req.body;

    const chat = await ChatMessage.create({
      appointmentId,
      senderId: req.user._id,
      senderRole: req.user.role,
      message
    });

    res.json(chat);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};


/* GET CHAT HISTORY */

export const getMessages = async (req, res) => {

  try {

    const messages = await ChatMessage.find({
      appointmentId: req.params.id
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};