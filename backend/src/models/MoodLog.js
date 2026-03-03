import mongoose from "mongoose";

const moodLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: {
      type: String,
      required: true,
      enum: [
        "happy/Energetic",
        "calm/Okay",
        "stressed/Heavy",
        "sad/Low",
        "angry/Frustrated",
        "tired/Burned Out",
      ],
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MoodLog", moodLogSchema);