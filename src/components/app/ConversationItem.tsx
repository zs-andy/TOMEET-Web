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
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      {conversation.type === "profile_building" ? (
        <User className="h-4 w-4 shrink-0 text-gray-400" />
      ) : (
        <MessageSquare className="h-4 w-4 shrink-0 text-gray-400" />
      )}
      <span className="truncate">{conversation.title}</span>
    </button>
  );
}
