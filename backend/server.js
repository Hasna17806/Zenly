
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server } from "socket.io";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store active rooms and users
const activeRooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  /* JOIN CHAT ROOM */
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    activeRooms.set(socket.id, roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
    
    // Notify others in room
    socket.to(roomId).emit("userJoined", { message: "A user has joined the chat" });
  });

  /* LEAVE ROOM */
  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    activeRooms.delete(socket.id);
    console.log(`Socket ${socket.id} left room ${roomId}`);
  });

  /* SEND MESSAGE */
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;
    console.log(`Message to room ${roomId}:`, message);
    
    io.to(roomId).emit("receiveMessage", message);
  });

  /* TYPING INDICATOR */
  socket.on("typing", ({ roomId, isTyping }) => {
    socket.to(roomId).emit("userTyping", { isTyping });
  });

  socket.on("disconnect", () => {
    const roomId = activeRooms.get(socket.id);
    if (roomId) {
      socket.to(roomId).emit("userLeft", { message: "A user has left the chat" });
      activeRooms.delete(socket.id);
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});