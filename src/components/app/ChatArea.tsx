"use client";

import { useChatStore } from "@/lib/chat/chat-context";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";

export function ChatArea() {
  const conversations = useChatStore((s) => s.conversations);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const isAgentTyping = useChatStore((s) => s.isAgentTyping);

  const conversation = conversations.find((c) => c.id === activeConversationId);

  if (!conversation) return <EmptyState />;

  return (
    <div className="flex h-full flex-col">
      <MessageList messages={conversation.messages} isAgentTyping={isAgentTyping} />
      <ChatInput />
    </div>
  );
}
