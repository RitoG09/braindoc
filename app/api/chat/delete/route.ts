import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const DELETE = async (req: Request) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { chatId } = await req.json();

    // Delete the chat
    await db.delete(chats).where(eq(chats.id, chatId));

    return NextResponse.json({
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
