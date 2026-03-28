import mongoose from "mongoose";

const chatbotMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ChatbotMessage", chatbotMessageSchema);
