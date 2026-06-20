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
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
        isActive
          ? "bg-gray-100 text-gray-900"
          : "text-gray-700 hover:bg-gray-50"
      )}
    >
      {conversation.type === "profile_building" ? (
        <User className="h-4 w-4 shrink-0" />
      ) : (
        <MessageSquare className="h-4 w-4 shrink-0" />
      )}
      <span className="truncate">{conversation.title}</span>
    </button>
  );
}
