"use client";

import React, { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { Message, useChat } from "@ai-sdk/react";
import { useQuery } from "@tanstack/react-query";
import MessageList from "./MessageList";
import axios from "axios";

type Mode = "chat" | "voice" | "yt-section";

interface VideoResult {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {

  const [videos, setVideos]=useState<VideoResult[]>([])
  const [isLoadingVideo,setIsLoadingVideo]= useState(false)
  const [videoError, setVideoError] = useState<string | null>(null);

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

  const { messages, handleInputChange, handleSubmit, input, setMessages} =
    useChat({
      api: "/api/chat",
      body: { chatId },
      initialMessages: data || [],
    });

  // Update messages when data changes
  useEffect(() => {
    if (data) {
      console.log("Updated messages from DB:", data); //Debugging
      setMessages([...data]); //Force re-render
    }
  }, [data, setMessages]);

  const [activeMode, setActiveMode] = useState<Mode>("chat");

  const handleModeToggle = (mode: Mode) => {
    setActiveMode((prevMode) => (prevMode === mode ? "chat" : mode));
  };

  //youtube search
  const searchYoutube = async (searchQuery: string) => {
    try {
      setIsLoadingVideo(true);
      setVideoError(null);
      const encodedQuery = encodeURIComponent(searchQuery);
      const { data } = await axios.get(
          `/api/yt?q=${encodedQuery}`
      );
      console.log("API Response:", data);

      if (data && data.videos && Array.isArray(data.videos)) {
        setVideos(data.videos);
        if (data.videos.length === 0) {
          setVideoError("No videos found for your search query");
        }
        return data.videos;
      } else {
        console.log("YouTube API failed");
        setVideos([])
        setVideoError("Failed to fetch videos");
        return [];
      }
    } catch (error: any) {
      console.error("Error searching YouTube:", error);
      setVideos([]);

      // Handle specific error messages
      if (error.response?.status === 403) {
        setVideoError("YouTube API quota exceeded. Please try again later.");
      } else if (error.response?.status === 400) {
        setVideoError("Invalid search query. Please try a different search.");
      } else if (error.response?.data?.error) {
        setVideoError(error.response.data.error);
      } else {
        setVideoError("Failed to search YouTube. Please check your internet connection.");
      }

      return [];
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Function to handle sending messages
  const handleSend= async (event: React.FormEvent) => {
    event.preventDefault();
    if(!input.trim()) return;
    console.log("Sending message...","Mode: ",activeMode);

    if(activeMode === "yt-section"){
      await searchYoutube(input)
    }else{
      handleSubmit(event); //Send the message
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Small delay for DB update
      await refetch(); // Force fetch new messages
      console.log("Messages refetched!"); //Debugging
    }
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
            {activeMode === "yt-section" ? "Video Search" : "Text with Doc"}
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-6">
          {activeMode === "chat" && <MessageList messages={messages} />}

          {activeMode === "yt-section" && (
              <div className="space-y-4">
                {isLoadingVideo && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
                      <span className="ml-2 text-gray-600">Searching for videos...</span>
                    </div>
                )}

                {videos && videos.length > 0 && !isLoadingVideo && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Video Results:</h3>
                      <div className="grid gap-4">
                        {videos.map((video, index) => (
                            <div
                                key={video.videoId}
                                onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                                className="flex bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer transition-colors duration-200 group"
                            >
                              {/* Thumbnail */}
                              <div className="flex-shrink-0 relative">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-32 h-24 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                                />
                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-red-600 rounded-full p-2">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M8 5v10l8-5-8-5z"/>
                                    </svg>
                                  </div>
                                </div>
                              </div>

                              {/* Video Info */}
                              <div className="ml-4 flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                  {video.title}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {video.channelTitle}
                                </p>
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                  {video.description}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <span>{video.publishedAt}</span>
                                </div>
                              </div>

                              {/* External link icon */}
                              <div className="flex-shrink-0 ml-2">
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {videos && videos.length === 0 && !isLoadingVideo && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mb-4">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p>Enter a search query to find YouTube videos</p>
                    </div>
                )}
              </div>
          )}
        </div>

        {/* Input Form */}
        <form
            onSubmit={handleSend}
            className="px-6 py-4 border-t border-gray-100 bg-white"
        >
          <div className="flex">
            <Input
                value={input}
                onChange={handleInputChange}
                placeholder={
                  activeMode === "yt-section"
                      ? "Search for a video..."
                      : "Ask any question..."
                }
                className="w-full"
            />
            <Button
                className="bg-blue-800 ml-2"
                type="submit"
                disabled={isLoadingVideo}
            >
              <Send className="size-4" />
            </Button>
          </div>
        </form>

        {/* Mode Selection Buttons */}
        <div className="p-6 border-t border-gray-100 flex justify-between space-x-3">
          {/*<button*/}
          {/*    onClick={() => handleModeToggle("voice")}*/}
          {/*    className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${*/}
          {/*        activeMode === "voice"*/}
          {/*            ? "bg-gray-100 text-gray-900 font-medium"*/}
          {/*            : "bg-white text-gray-500 hover:bg-gray-50"*/}
          {/*    }`}*/}
          {/*>*/}
          {/*  <span>Podcast</span>*/}
          {/*</button>*/}
          <button
              onClick={() => handleModeToggle("yt-section")}
              className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${
                  activeMode === "yt-section"
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
