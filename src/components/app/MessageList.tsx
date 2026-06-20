"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/lib/chat/types";
import { MessageBubble } from "./MessageBubble";
import { Loader2 } from "lucide-react";

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
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-2xl space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isAgentTyping && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">正在输入...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
