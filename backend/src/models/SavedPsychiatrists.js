import mongoose from "mongoose";

const savedPsychiatristsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  psychiatristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Psychiatrist",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("SavedPsychiatrists", savedPsychiatristsSchema);