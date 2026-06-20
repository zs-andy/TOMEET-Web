"use client";

import { MessageSquare, User } from "lucide-react";
import { useChatContext } from "@/lib/chat/chat-context";
import { cn } from "@/lib/utils";

type Props = {
  conversation: { id: string; title: string; type: string };
};

export function ConversationItem({ conversation }: Props) {
  const { state, setActiveConversation } = useChatContext();
  const isActive = state.activeConversationId === conversation.id;

  return (
    <button
      onClick={() => setActiveConversation(conversation.id)}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        isActive
          ? "bg-gray-200/60 text-gray-900"
          : "text-gray-600 hover:bg-gray-200/40"
      )}
    >
      <span className="truncate">{conversation.title}</span>
    </button>
  );
}
