import ChatComponent from "@/components/ChatComponent";
import PDFviewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: { chatId: string };
};

const Chatpage = async ({ params }: Props) => {
  const { chatId } = params;
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex w-full max-h-screen ">
      {/*chat sidebar */}
      {/* <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div> */}

      {/*pdf viewer*/}
      <div className="flex-1 max-h-screen p-4 ">
        <PDFviewer pdf_url={currentChat?.pdfUrl || ""} />
      </div>

      {/*chatting with pdf */}
      <div className="flex-1 p-4">
        <ChatComponent chatId={parseInt(chatId)} />
      </div>
    </div>
  );
};

export default Chatpage;
