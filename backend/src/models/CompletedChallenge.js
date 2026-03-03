import mongoose from "mongoose";

const completedChallengeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
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