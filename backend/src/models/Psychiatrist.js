import mongoose from "mongoose";

const psychiatristSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    specialization: String,
  },
  { timestamps: true }
);

export default mongoose.model("Psychiatrist", psychiatristSchema);
