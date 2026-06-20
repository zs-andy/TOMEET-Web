"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/chat/types";
import { MessageBubble } from "./MessageBubble";
import { Bot } from "lucide-react";

type Props = {
  messages: Message[];
  isAgentTyping: boolean;
};

export function MessageList({ messages, isAgentTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAgentTyping]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 space-y-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isAgentTyping && (
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 mt-0.5">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5 py-2">
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
