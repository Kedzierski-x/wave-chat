import dotenv from "dotenv";
dotenv.config();
import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import Message from "./src/models/Message"; // Model wiadomości
import Conversation from "./src/models/Conversation"; // Model konwersacji
import connectToDatabase from "./src/services/db"; // Połączenie z bazą danych
import User from "./src/models/User";


// Rozszerzenie typu WebSocket
interface ExtendedWebSocket extends WebSocket {
  userId?: string;
}

// Tworzenie serwera HTTP do WebSocket
const server = http.createServer();
const wss = new WebSocketServer({ server });

// Połączenie z bazą danych MongoDB
connectToDatabase();

interface WebSocketMessage {
  type: string;
  userId?: string;
  recipientId?: string;
  content?: string;
}

// Obsługa połączeń WebSocket
wss.on("connection", (ws: ExtendedWebSocket) => {
  console.log("Client connected");

  ws.on("message", async (data: string) => {
    const message: WebSocketMessage = JSON.parse(data);

    // Przypisz userId do WebSocket przy połączeniu
    if (message.type === "join" && message.userId) {
      console.log(`User ${message.userId} joined`);
      ws.userId = message.userId;
    }

    if (message.type === "message") {
      try {
        const { userId, recipientId, content } = message;

        if (!userId || !recipientId || !content) return;

        // Znajdź lub utwórz konwersację
        let conversation = await Conversation.findOne({
          participants: { $all: [userId, recipientId] },
        });

        if (!conversation) {
          conversation = await Conversation.create({
            participants: [userId, recipientId],
          });
        }

        // Zapisz wiadomość
        const newMessage = new Message({
          conversation: conversation._id,
          sender: userId,
          content,
          read: false,
        });
        await newMessage.save();

        // Pobierz dane nadawcy
        const senderUser = await User.findById(userId).select(
          "id name email avatar"
        );

        const messageData = {
          id: newMessage._id,
          sender: {
            id: senderUser._id,
            name: senderUser.name,
            email: senderUser.email,
            avatar: senderUser.avatar,
          },
          content: newMessage.content,
          createdAt: newMessage.createdAt,
        };

        // Wyślij wiadomość do odbiorcy i nadawcy
        wss.clients.forEach((client) => {
          const extendedClient = client as ExtendedWebSocket;
          if (
            (extendedClient.userId === recipientId ||
              extendedClient.userId === userId) &&
            client.readyState === WebSocket.OPEN
          ) {
            client.send(JSON.stringify(messageData));
          }
        });

        console.log("Message sent and saved to DB");
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
// Uruchomienie serwera
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
