import ChatComponent from "@/components/ChatComponent";
import PDFviewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

// Define the type for props
interface ChatPageProps {
  params: { chatId: any };
}

// Next.js expects a default exported function
export default async function Chatpage({ params }: ChatPageProps) {
  // Ensure params is correctly parsed
  if (!params?.chatId) return redirect("/");

  const parsedChatId = parseInt(params.chatId, 10);

  // Check authentication
  const authData = await auth(); // auth() returns an object, so extract userId properly
  const userId = authData?.userId;
  if (!userId) return redirect("/sign-in");

  // Fetch chats from the database
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  // Ensure chat exists and belongs to user
  if (!_chats || !_chats.some((chat) => chat.id === parsedChatId)) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parsedChatId);

  return (
    <div className="flex w-full max-h-screen">
      {/* PDF Viewer */}
      <div className="flex-1 max-h-screen p-4">
        <PDFviewer pdf_url={currentChat?.pdfUrl || ""} />
      </div>

      {/* Chat Component */}
      <div className="flex-1 p-4">
        <ChatComponent chatId={parsedChatId} />
      </div>
    </div>
  );
}
