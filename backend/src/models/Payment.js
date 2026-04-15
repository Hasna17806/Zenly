import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    psychiatristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Psychiatrist",
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    psychiatristAmount: {
      type: Number,
      required: true
    },
    adminCommission: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    paypalOrderId: {
      type: String
    },
    paypalCaptureId: {
      type: String
    },
    paypalResponse: {
      type: Object
    }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);