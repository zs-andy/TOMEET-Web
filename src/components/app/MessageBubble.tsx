"use client";

import { Message } from "@/lib/chat/types";
import { MatchCard } from "./MatchCard";
import { TypewriterText } from "./TypewriterText";
import { cn } from "@/lib/utils";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5",
          isUser
            ? "bg-orange-500 text-white"
            : "bg-white text-gray-800 border border-gray-100"
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <TypewriterText
            text={message.content}
            className="text-sm leading-relaxed"
          />
        )}
        {message.match && (
          <div className="mt-3">
            <MatchCard match={message.match} />
          </div>
        )}
      </div>
    </div>
  );
}
