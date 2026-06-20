"use client";

import { Bot } from "lucide-react";
import { Message } from "@/lib/chat/types";
import { MatchCard } from "./MatchCard";
import { TypewriterText } from "./TypewriterText";
import { cn } from "@/lib/utils";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-gray-900 px-4 py-2.5 text-white">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 mt-0.5">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="max-w-[85%]">
          <TypewriterText
            text={message.content}
            className="text-sm leading-relaxed text-gray-800"
          />
          {message.match && (
            <div className="mt-3 max-w-xs">
              <MatchCard match={message.match} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
