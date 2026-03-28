import ChatbotMessage from "../models/ChatbotMessage.js";

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Save user message
    const userMsg = await ChatbotMessage.create({
      user: req.user.id,
      message,
      sender: "user",
    });

    // Simple bot reply 
    const botReplyText = getBotReply(message);

    const botMsg = await ChatbotMessage.create({
      user: req.user.id,
      message: botReplyText,
      sender: "bot",
    });

    res.json({
      userMsg,
      botMsg,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add this new function to get chat history
export const getChatHistory = async (req, res) => {
  try {
    const messages = await ChatbotMessage.find({ user: req.user.id })
      .sort({ createdAt: 1 }) // Oldest first
      .limit(50); // Limit to last 50 messages

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBotReply = (message) => {
  const msg = message.toLowerCase();

  if (msg.includes("stress") || msg.includes("stressed")) {
    return "I'm sorry you're feeling stressed. Want to try a breathing challenge?";
  }
  if (msg.includes("sad") || msg.includes("depress")) {
    return "That sounds tough. Remember, it's okay to feel sad sometimes 💙";
  }
  if (msg.includes("happy") || msg.includes("good")) {
    return "I'm so happy to hear that! 😊 What's making you feel good today?";
  }
  if (msg.includes("tired") || msg.includes("exhaust")) {
    return "Being tired is rough. Make sure to take small breaks. Maybe try a quick blink break? ⚡";
  }
  if (msg.includes("angry") || msg.includes("mad")) {
    return "It's okay to feel angry. Take a deep breath. Want to try a calm taps exercise? 💧";
  }
  if (msg.includes("hello") || msg.includes("hi")) {
    return "Hey there! How are you feeling today? I'm here to listen 💬";
  }
  if (msg.includes("help")) {
    return "I can help you with:\n• Talking about your feelings\n• Suggesting mood challenges\n• Breathing exercises\n• Just listening 😊";
  }

  return "Tell me more. I'm here to listen 😊";
};