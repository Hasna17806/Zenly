import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();

/* create http server */

const server = http.createServer(app);

/* socket setup */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  /* JOIN CHAT ROOM */

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  /* SEND MESSAGE */

  socket.on("sendMessage", (data) => {

    // send message to everyone in room except sender
    socket.to(data.roomId).emit("receiveMessage", data.message);

  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

});

/* start server */

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});