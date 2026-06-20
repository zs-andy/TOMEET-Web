"use client";

import { useChatContext } from "@/lib/chat/chat-context";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";

export function ChatArea() {
  const { state } = useChatContext();

  const conversation = state.conversations.find(
    (c) => c.id === state.activeConversationId
  );

  if (!conversation) {
    return <EmptyState />;
  }

  return (
    <div className="flex h-full flex-col">
      <MessageList
        messages={conversation.messages}
        isAgentTyping={state.isAgentTyping}
      />
      <ChatInput />
    </div>
  );
}
