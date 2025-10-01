import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3001", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Chat server is running" });
});

// Store connected users
const users = new Map<string, string>();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining
  socket.on("join", (username: string) => {
    users.set(socket.id, username);
    io.emit("userJoined", {
      userId: socket.id,
      username,
      users: Array.from(users.values()),
    });
  });

  // Handle chat messages
  socket.on("message", (data: { content: string }) => {
    const username = users.get(socket.id);
    if (username) {
      io.emit("message", {
        id: Math.random().toString(36).substring(7),
        userId: socket.id,
        username,
        content: data.content,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit("userLeft", {
        userId: socket.id,
        username,
        users: Array.from(users.values()),
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
