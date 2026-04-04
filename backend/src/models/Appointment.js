import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    psychiatristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Psychiatrist",
      required: true,
    },

    date: {
      type: String,
      default: null,
    },

    time: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);