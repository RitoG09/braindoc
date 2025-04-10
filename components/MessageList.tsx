import React from "react";
import { Message } from "ai";
import { cn } from "@/lib/utils";

type Props = {
  // isloading: boolean;
  messages: Message[];
};

function MessageList({ messages }: Props) {
  // if (isloading) {
  //   return (
  //     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-1/2">
  //       <Loader2 className="size-6 animate-spin" />
  //     </div>
  //   );
  // }

  if (!messages) return <></>;
  return (
    <div className="flex flex-col gap-2 px-4">
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={cn("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pl-10 mb-3": message.role === "assistant",
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 text-sm py-2 shadow-md ring-1 ring-gray-900/10 ",
                {
                  "bg-blue-800 text-white": message.role === "user",
                  "bg-slate-400 text-white ": message.role === "assistant",
                }
              )}
            >
              <p>{message.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MessageList;
