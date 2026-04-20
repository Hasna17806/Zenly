import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const psychiatristSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ""
    },

    specialization: {
      type: String,
      required: true
    },

    consultationFee: {
      type: Number,
      required: true
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    documents: [{
      type: String,
      default: []
    }]

  },
  { timestamps: true }
);

// HASH PASSWORD BEFORE SAVING
psychiatristSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// PASSWORD COMPARISON METHOD
psychiatristSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Psychiatrist", psychiatristSchema);