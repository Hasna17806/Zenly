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

    category: {
      type: String,
      required: true,
      enum: [
        "mood-boost",
        "study",
        "fun",
        "quick-play",
      ],
    },

    image: {
      type: String,
    },

    duration: {
      type: String,
    },

    route: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;