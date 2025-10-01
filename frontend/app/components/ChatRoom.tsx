"use client";

import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

interface UserInfo {
  userId: string;
  username: string;
  roomId: string;
}

interface Props {
  initialRoomId: string;
}

export default function ChatRoom({ initialRoomId }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [roomId, setRoomId] = useState(initialRoomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL);
    setSocket(newSocket);

    // Handle received messages
    newSocket.on("message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Handle message history
    newSocket.on("messageHistory", (messages: Message[]) => {
      setMessages(messages);
    });

    // Handle user join/leave updates
    newSocket.on(
      "userJoined",
      ({ users, roomId: newRoomId }: { users: string[]; roomId: string }) => {
        setUsers(users);
        setRoomId(newRoomId);
      }
    );

    newSocket.on("userLeft", ({ users }: { users: string[] }) => {
      setUsers(users);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && socket) {
      socket.emit("join", { username, roomId: initialRoomId });
      setIsJoined(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit("message", { content: input.trim() });
      setInput("");
    }
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleJoin}
          className="bg-white p-8 rounded-lg shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Join Chat
          </h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Join
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen p-4 gap-4 bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-md p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500">Room ID:</h3>
          <p className="text-gray-800 font-mono">{roomId}</p>
        </div>
        <h3 className="text-lg font-semibold mb-4 text-gray-700">
          Online Users ({users.length})
        </h3>
        <ul className="space-y-2">
          {users.map((user, index) => (
            <li key={index} className="p-2 bg-gray-50 rounded-md text-gray-700">
              {user}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[70%] ${
                  msg.username === username ? "ml-auto" : "mr-auto"
                }`}
              >
                <div
                  className={`rounded-lg p-3 ${
                    msg.username === username
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span
                      className={
                        msg.username === username
                          ? "text-blue-100"
                          : "text-gray-600"
                      }
                    >
                      {msg.username}
                    </span>
                    <span
                      className={
                        msg.username === username
                          ? "text-blue-100"
                          : "text-gray-600"
                      }
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
