import mongoose from "mongoose";

const challengeSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    moodTag: {
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
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;