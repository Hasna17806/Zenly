import mongoose from "mongoose";

const completedChallengeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    challengeId: {
      type: String,
      required: true,
    },

    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const CompletedChallenge = mongoose.model("CompletedChallenge", completedChallengeSchema);

export default CompletedChallenge;