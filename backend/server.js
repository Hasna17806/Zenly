import dotenv from "dotenv";
dotenv.config(); 

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

// Debug check
console.log("ENV CHECK:", process.env.MONGO_URI);

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
