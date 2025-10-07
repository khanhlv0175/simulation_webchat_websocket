"use client";

import { Message } from "@/types";
import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";

interface Props {
  initialRoomId: string;
  chatHistory: Message[];
}

export default function ChatRoom({ initialRoomId, chatHistory }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>(chatHistory);
  const [users, setUsers] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [input, setInput] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomId, setRoomId] = useState(initialRoomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);
    setIsConnecting(true);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    setMessages(chatHistory);
  }, [chatHistory]);

  // Handle connection events
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnecting(false);
      setError(null);
    };

    const onConnectError = (err: Error) => {
      setIsConnecting(false);
      setError("Failed to connect to chat server");
      console.error("Connection error:", err);
    };

    const onError = (err: Error) => {
      setError(err.message || "An error occurred");
    };

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("error", onError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("error", onError);
    };
  }, [socket]);

  // Handle chat events
  useEffect(() => {
    if (!socket) return;

    const onMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    const onUserJoined = ({
      users,
      roomId: newRoomId,
    }: {
      users: string[];
      roomId: string;
    }) => {
      setUsers(users);
      setRoomId(newRoomId);
    };

    const onUserLeft = ({
      users,
      roomId: newRoomId,
    }: {
      users: string[];
      roomId: string;
    }) => {
      setUsers(users);
      setRoomId(newRoomId);
    };

    socket.on("message", onMessage);
    socket.on("userJoined", onUserJoined);
    socket.on("userLeft", onUserLeft);

    return () => {
      socket.off("message", onMessage);
      socket.off("userJoined", onUserJoined);
      socket.off("userLeft", onUserLeft);
    };
  }, [socket]);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Connection Error
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
            <p className="text-lg text-gray-600">
              Connecting to chat server...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Main Container */}
      <div className="flex flex-1 m-4 rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Sidebar - User List */}
        <div className="w-72 border-r border-gray-200 bg-white">
          {/* Room Info Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Room Chat</h2>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span>{users.length} online</span>
              </div>
              <div className="mx-2">•</div>
              <div className="font-mono text-xs truncate" title={roomId}>
                ID: {roomId}
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Online Users
            </h3>
            <div className="space-y-2">
              {users.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-medium">
                    {user[0]}
                  </div>
                  <span className="ml-3 text-gray-700">{user}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
            <div className="space-y-3 px-2">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${
                    msg.username === username ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Message Container */}
                  <div
                    className={`max-w-[80%] flex ${
                      msg.username === username
                        ? "flex-row-reverse"
                        : "flex-row"
                    } items-end group`}
                  >
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex-shrink-0 flex items-center justify-center text-white text-xs">
                      {msg.username[0]}
                    </div>

                    {/* Message Content */}
                    <div
                      className={`mx-2 ${
                        msg.username === username
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      } px-4 py-2 rounded-2xl shadow-sm`}
                    >
                      <p className="text-sm mb-1">{msg.content}</p>
                      <div
                        className={`text-xs ${
                          msg.username === username
                            ? "text-blue-100"
                            : "text-gray-500"
                        } opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        {msg.username} •{" "}
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-12 py-3 rounded-full border border-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-indigo-500 transition-all shadow-md hover:shadow-lg"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
