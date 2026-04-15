import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    psychiatristId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Psychiatrist",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    slots: [
      {
        time: {
          type: String,
          required: true
        },
        isBooked: {
          type: Boolean,
          default: false
        },
        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null
        },
        appointmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Appointment",
          default: null
        }
      }
    ]
  },
  { timestamps: true }
);

// Compound index to ensure unique psychiatrist+date combination
availabilitySchema.index({ psychiatristId: 1, date: 1 }, { unique: true });

export default mongoose.model("Availability", availabilitySchema);