import AllDocBar from "@/components/AllDocBar";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  params: { chatId: string };
};

const MyDoc = async ({ params }: Props) => {
  const { chatId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const allChats = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId));
  if (!allChats) {
    return redirect("/");
  }

  return (
    <div className="h-screen bg-slate-100">
      <div className="w-full max-w-4xl mx-auto">
        <div className="p-4 border-b border-slate-200">
          <Link
            href="/dashboard/upload"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Dashboard</span>
          </Link>
        </div>
        <AllDocBar chats={allChats} chatId={parseInt(chatId)} />
      </div>
    </div>
  );
};

export default MyDoc;
