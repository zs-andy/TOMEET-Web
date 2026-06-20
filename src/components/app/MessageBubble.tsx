"use client";

import { Message } from "@/lib/chat/types";
import { MatchCard } from "./MatchCard";
import { TypewriterText } from "./TypewriterText";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gray-900 px-4 py-2.5">
          <p className="text-sm leading-relaxed text-white">{message.content}</p>
        </div>
      </div>
    );
  }

  // Agent: gray bubble with bl-sm tail, matching the landing demo
  return (
    <div className="flex justify-start">
      <div className="max-w-[80%]">
        <div className="rounded-2xl rounded-bl-sm bg-gray-50 px-4 py-2.5">
          <TypewriterText
            text={message.content}
            className="text-sm leading-relaxed text-gray-900"
          />
        </div>
        {message.match && (
          <div className="mt-2 max-w-xs">
            <MatchCard match={message.match} />
          </div>
        )}
      </div>
    </div>
  );
}
