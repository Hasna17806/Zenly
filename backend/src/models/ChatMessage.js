import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
{
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  senderRole: {
    type: String,
    enum: ["student", "psychiatrist"],
    required: true
  },

  message: {
    type: String,
    required: true
  }

},
{ timestamps: true }
);

export default mongoose.model("ChatMessage", chatSchema);