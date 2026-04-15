import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    psychiatristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Psychiatrist",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isVisible: {
      type: Boolean,
      default: true
    },
    helpful: {
      type: Number,
      default: 0
    },
    reported: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Ensure one review per user per psychiatrist
reviewSchema.index({ psychiatristId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);