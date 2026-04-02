import mongoose from "mongoose";

const completedChallengeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // store challenge id from frontend
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

completedChallengeSchema.index({ user: 1, challengeId: 1 }, { unique: true });

const CompletedChallenge = mongoose.model(
  "CompletedChallenge",
  completedChallengeSchema
);

export default CompletedChallenge;