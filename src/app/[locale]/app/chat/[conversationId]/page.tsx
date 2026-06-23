"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatStore } from "@/lib/chat/chat-context";
import { ChatArea } from "@/components/app/ChatArea";

export default function ConversationPage() {
  const params = useParams();
  const setActiveConversation = useChatStore((s) => s.setActiveConversation);
  const conversationId = params.conversationId as string;

  useEffect(() => {
    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);

  return <ChatArea />;
}
