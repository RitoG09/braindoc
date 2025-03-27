"use client";

import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "./ui/button";
import { FileText, Clock, Trash2, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const AllDocBar = ({ chats, chatId }: Props) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDelete = async (e: React.MouseEvent, chatId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(chatId);

    try {
      await axios.delete("/api/chat/delete", {
        data: { chatId },
      });

      toast.success("Document deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-slate-50 to-white">
      <div className="flex flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-indigo-600">Document Store</h2>
          <Button
            asChild
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 flex items-center gap-2"
          >
            <Link href="/dashboard/upload">
              <PlusCircle className="w-4 h-4" />
              New Document
            </Link>
          </Button>
        </div>

        {/* Documents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {chats.map((chat) => (
            <div key={chat.id} className="relative group">
              <Link href={`/chat/${chat.id}`}>
                <div
                  className={cn(
                    "rounded-xl p-4 transition-all duration-200 flex flex-col gap-3 border shadow-sm",
                    {
                      "bg-indigo-50 border-indigo-200 shadow-md":
                        chat.id === chatId,
                      "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md":
                        chat.id !== chatId,
                    }
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={cn("p-2 rounded-lg", {
                        "bg-indigo-100": chat.id === chatId,
                        "bg-slate-100 group-hover:bg-indigo-50":
                          chat.id !== chatId,
                      })}
                    >
                      <FileText
                        className={cn("w-5 h-5", {
                          "text-indigo-600": chat.id === chatId,
                          "text-slate-600 group-hover:text-indigo-600":
                            chat.id !== chatId,
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <p
                      className={cn("text-sm font-medium truncate", {
                        "text-indigo-900": chat.id === chatId,
                        "text-slate-700 group-hover:text-indigo-900":
                          chat.id !== chatId,
                      })}
                    >
                      {chat.pdfname}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">
                        {new Date(chat.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Delete Button - Outside Link */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => handleDelete(e, chat.id)}
                  disabled={isDeleting === chat.id}
                >
                  <Trash2
                    className={cn(
                      "w-4 h-4",
                      isDeleting === chat.id && "animate-spin"
                    )}
                  />
                </Button>
              </div>
            </div>
          ))}

          {chats.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-indigo-50 mb-4">
                <FileText className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No documents yet
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Upload your first document to get started
              </p>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 flex items-center gap-2"
              >
                <Link href="/dashboard/upload">
                  <PlusCircle className="w-4 h-4" />
                  Upload Document
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllDocBar;
