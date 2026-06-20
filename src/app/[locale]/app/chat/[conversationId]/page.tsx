"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatContext } from "@/lib/chat/chat-context";
import { ChatArea } from "@/components/app/ChatArea";

export default function ConversationPage() {
  const params = useParams();
  const { setActiveConversation } = useChatContext();
  const conversationId = params.conversationId as string;

  useEffect(() => {
    setActiveConversation(conversationId);
  }, [conversationId, setActiveConversation]);

  return <ChatArea />;
}
