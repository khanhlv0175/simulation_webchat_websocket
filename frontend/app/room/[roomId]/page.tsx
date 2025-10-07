"use client";

import { useEffect, useState } from "react";
import ChatRoom from "@/components/ChatRoom";
import { Message } from "@/types";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId;
  const [isValidRoom, setIsValidRoom] = useState(true);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  useEffect(() => {
    // Verify if the room exists
    const checkRoom = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${roomId}`
        );
        if (!response.ok) {
          setIsValidRoom(false);
          setChatHistory([]);
        } else {
          const data = await response.json();
          console.log(data);
          setChatHistory(data.messages);
        }
      } catch (error) {
        console.error("Error checking room:", error);
        setIsValidRoom(false);
      }
    };

    checkRoom();
  }, [roomId]);

  if (!isValidRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-600">
            Room Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The room you're trying to join doesn't exist.
          </p>
          <a
            href="/"
            className="block w-full text-center bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  return <ChatRoom initialRoomId={roomId} chatHistory={chatHistory} />;
}
