import express from "express";
import http from "http";
import { Server } from "socket.io";
import connectToDatabase from "./src/services/db"; // Połączenie z bazą danych
import Message from "./src/models/Message"; // Model wiadomości
import User from "./src/models/User"; // Model użytkownika (jeśli istnieje)

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Połącz z bazą danych
connectToDatabase();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    console.log(`User ${userId} joined their personal room.`);
    socket.join(userId); // Użytkownik dołącza do swojego pokoju
  });

  socket.on("message", async (data) => {
    try {
      const { sender, recipientId, content } = data;

      // Utwórz nową wiadomość i zapisz ją w bazie danych
      const message = await Message.create({
        sender: sender.id,
        recipient: recipientId,
        content,
        createdAt: new Date(),
        read: false,
      });

      // Wyślij wiadomość do odbiorcy (jeśli jest połączony)
      io.to(recipientId).emit("message", {
        id: message._id,
        sender,
        content,
        createdAt: message.createdAt,
        read: message.read,
      });

      console.log("Message saved and sent:", message);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server is running on port ${PORT}`);
});
