import mongoose from "mongoose";

const focusSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    duration: {
      type: Number,
      required: true, 
    },
  },
  { timestamps: true }
);

const FocusSession = mongoose.model("FocusSession", focusSessionSchema);

export default FocusSession;