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
  },
  { timestamps: true }
);

const CompletedChallenge = mongoose.model(
  "CompletedChallenge",
  completedChallengeSchema
);

export default CompletedChallenge;