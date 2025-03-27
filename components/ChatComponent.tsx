"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { Message, useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import MessageList from "./MessageList";
import axios from "axios";

type Mode = "chat" | "voice" | "video";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const res = await axios.post<Message[]>("/api/get-messages", { chatId });
      console.log("Fetched messages from API:", res.data);
      return res.data;
    },
    refetchInterval: 3000,
    staleTime: 0,
  });

  const { messages, handleInputChange, handleSubmit, input, setMessages } =
    useChat({
      api: "/api/chat",
      body: { chatId },
      initialMessages: data || [],
    });

  // Update messages when data changes
  useEffect(() => {
    if (data) {
      console.log("Updated messages from DB:", data); // ✅ Debugging
      setMessages([...data]); // 🔄 Force re-render
    }
  }, [data]);

  const [activeMode, setActiveMode] = useState<Mode>("chat");

  const handleModeToggle = (mode: Mode) => {
    setActiveMode((prevMode) => (prevMode === mode ? "chat" : mode));
  };

  // Function to handle sending messages and refetch messages after sending
  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();

    console.log("Sending message..."); // ✅ Debugging

    await handleSubmit(event); // Send the message
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay for DB update
    await refetch(); // Force fetch new messages
    console.log("Messages refetched!"); // ✅ Debugging
  };

  useEffect(() => {
    const messageContainer = document.getElementById("container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div
      className="w-full h-full bg-white rounded-lg flex flex-col"
      id="container"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">
          Interaction with Doc
        </h2>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-6">
        {activeMode === "chat" && <MessageList messages={messages} />}
      </div>

      <form
        onSubmit={handleSend}
        className="px-6 py-4 border-t border-gray-100 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-800 ml-2" type="submit">
            <Send className="size-4" />
          </Button>
        </div>
      </form>

      {/* Mode Selection Buttons */}
      <div className="p-6 border-t border-gray-100 flex justify-between space-x-3">
        <button
          onClick={() => handleModeToggle("voice")}
          className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeMode === "voice"
              ? "bg-gray-100 text-gray-900 font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span>Podcast</span>
        </button>
        <button
          onClick={() => handleModeToggle("video")}
          className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeMode === "video"
              ? "bg-gray-100 text-gray-900 font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span>Video</span>
        </button>
        <button
          onClick={() => handleModeToggle("chat")}
          className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
            activeMode === "chat"
              ? "bg-gray-100 text-gray-900 font-medium"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          <span>Text Chat</span>
        </button>
      </div>
    </div>
  );
};

export default ChatComponent;
