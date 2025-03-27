import ChatComponent from "@/components/ChatComponent";
import PDFviewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

// Define the type for props
type Props = {
  params: Promise<{ chatId: string }>;
};
// Next.js expects a default exported function
const Chatpage = async ({ params }: Props) => {
  const { chatId } = await params;
  // Check authentication
  const authData = await auth(); // auth() returns an object, so extract userId properly
  const userId = authData?.userId;
  if (!userId) return redirect("/sign-in");

  // Fetch chats from the database
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  // Ensure chat exists and belongs to user
  if (!_chats || !_chats.some((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex w-full max-h-screen">
      {/* PDF Viewer */}
      <div className="flex-1 max-h-screen p-4">
        <PDFviewer pdf_url={currentChat?.pdfUrl || ""} />
      </div>

      {/* Chat Component */}
      <div className="flex-1 p-4">
        <ChatComponent chatId={parseInt(chatId)} />
      </div>
    </div>
  );
};

export default Chatpage;
