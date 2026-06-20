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
    <div className="flex h-full flex-col bg-white">
      {/* Conversation header */}
      <div className="flex items-center border-b border-gray-100 px-6 py-3">
        <h2 className="text-sm font-medium text-gray-700 truncate">
          {conversation.title}
        </h2>
      </div>
      {/* Messages */}
      <MessageList
        messages={conversation.messages}
        isAgentTyping={state.isAgentTyping}
      />
      {/* Input */}
      <ChatInput />
    </div>
  );
}
