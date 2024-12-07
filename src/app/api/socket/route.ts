import { NextApiRequest } from "next";
import { Server as IoServer } from "socket.io";
import { Server as HttpServer } from "http";
import { Socket as NetSocket } from "net";

interface SocketServer extends HttpServer {
  io?: IoServer;
}

export const config = {
  api: {
    bodyParser: false, // Wyłącz bodyParser, Socket.IO go nie potrzebuje
  },
};

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log("Initializing Socket.IO server...");
    const io = new IoServer(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("User connected");

      socket.on("sendMessage", (message) => {
        console.log("Message received:", message);
        io.emit("receiveMessage", message);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected");
      });
    });
  } else {
    console.log("Socket.IO server already running");
  }

  res.end(); // Kończymy odpowiedź API
}
