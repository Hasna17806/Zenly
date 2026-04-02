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
        "Mood Boost",
        "Study",
        "Fun",
        "Quick Play",
      ],
    },

    image: {
      type: String,
    },

    duration: {
      type: String,
    },

    moodTag: {
      type: [String],
      default: [],
    },

    // ADD THIS FIELD - maps to game routes
    gameType: {
      type: String,
      enum: [
        'breathing', 'gratitude', 'smile-challenge', 'bubbles', 
        'focus-sprint', 'memory', 'quiz', 'focus', 'sound', 
        'matching', 'stars', 'wheel', 'timer', 'blink-break', 'journal'
      ],
      default: 'timer'
    },
  },
  { timestamps: true }
);

const Challenge = mongoose.model("Challenge", challengeSchema);

export default Challenge;