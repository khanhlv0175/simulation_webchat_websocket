import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/Message";
import ChatRoom from "./models/ChatRoom";
import authRoutes from "./routes/auth";
import locationsRoutes from "./routes/locations";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/webchat")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store connected users and their rooms
interface UserInfo {
  username: string;
  roomId: string;
}

const users = new Map<string, UserInfo>();

// Create or join a chat room
async function getOrCreateRoom(roomId?: string): Promise<string> {
  if (roomId) {
    const existingRoom = await ChatRoom.findOne({ roomId });
    if (existingRoom) {
      return existingRoom.roomId;
    }
  }

  const newRoomId = require("crypto").randomBytes(6).toString("hex");
  const newRoom = await ChatRoom.create({
    roomId: newRoomId,
    name: roomId ? `Room ${roomId}` : "New Room",
  });
  return newRoom.roomId;
}

// API endpoints for chat rooms
app.post("/api/rooms", async (req, res) => {
  try {
    // const roomId = require("crypto").randomBytes(6).toString("hex");
    const room = new ChatRoom({
      name: req.body.name || "New Room",
      roomId: Math.random().toString(36).substring(2, 8),
    });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    console.log("create room failed: ", error);
    res.status(500).json({ error: "Failed to create room" });
  }
});

app.get("/api/rooms/:roomId", async (req, res) => {
  try {
    const [room, messages] = await Promise.all([
      ChatRoom.findOne({ roomId: req.params.roomId }),
      Message.find({ roomId: req.params.roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .sort({ timestamp: 1 }),
    ]);

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.json({
      room,
      messages,
    });
  } catch (error) {
    console.error("Error fetching room data:", error);
    res.status(500).json({ error: "Failed to fetch room data" });
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle user joining a room
  socket.on(
    "join",
    async ({ username, roomId }: { username: string; roomId?: string }) => {
      try {
        const finalRoomId = await getOrCreateRoom(roomId);

        // Join the socket.io room
        socket.join(finalRoomId);

        // Store user info
        users.set(socket.id, { username, roomId: finalRoomId });

        // Get all users in this room
        const roomUsers = Array.from(users.entries())
          .filter(([_, user]) => user.roomId === finalRoomId)
          .map(([_, user]) => user.username);

        // Send room info to the user
        io.to(finalRoomId).emit("userJoined", {
          userId: socket.id,
          username,
          users: roomUsers,
          roomId: finalRoomId,
        });

        // Send message history
        try {
          const messages = await Message.find({ roomId: finalRoomId })
            .sort({ timestamp: -1 })
            .limit(50)
            .sort({ timestamp: 1 });
          socket.emit("messageHistory", messages);
        } catch (error) {
          console.error("Error fetching message history:", error);
        }
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    }
  ); // Handle chat messages
  socket.on("message", async (data: { content: string }) => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      const messageData = {
        userId: socket.id,
        username: userInfo.username,
        content: data.content,
        roomId: userInfo.roomId,
        timestamp: new Date(),
      };

      try {
        // Save message to database
        const savedMessage = await Message.create(messageData);

        // Broadcast message only to users in the same room
        io.to(userInfo.roomId).emit("message", {
          id: savedMessage.id,
          ...messageData,
          timestamp: messageData.timestamp.toISOString(),
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    }
  }); // Handle disconnection
  socket.on("disconnect", () => {
    const userInfo = users.get(socket.id);
    if (userInfo) {
      // Get updated list of users in the room
      const roomUsers = Array.from(users.entries())
        .filter(([_, user]) => user.roomId === userInfo.roomId)
        .filter(([id, _]) => id !== socket.id)
        .map(([_, user]) => user.username);

      // Remove user from the list
      users.delete(socket.id);

      // Notify other users in the same room
      io.to(userInfo.roomId).emit("userLeft", {
        userId: socket.id,
        username: userInfo.username,
        users: roomUsers,
      });

      // Leave the socket.io room
      socket.leave(userInfo.roomId);
    }
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.use("/api", authRoutes);
app.use("/api", locationsRoutes);
