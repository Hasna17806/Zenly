import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";
import focusRoutes from "./routes/focusRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
// import psychiatristRoutes from "./routes/psychiatristRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from './routes/uploadRoutes.js';
import completedChallengeRoutes from "./routes/completedChallengeRoutes.js";
import adminRoutes from "./admin/adminRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Zenly API Running ✅");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/focus", focusRoutes);
app.use("/api/challenges", challengeRoutes);
// app.use("/api/psychiatrist", psychiatristRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/completed-challenges", completedChallengeRoutes);
app.use("/api/admin", adminRoutes);

export default app;
