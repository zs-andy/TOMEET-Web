"use client";

import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";
import { ConversationItem } from "./ConversationItem";

export function ConversationList() {
  const t = useTranslations("app");
  const { state } = useChatContext();

  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;

  const today = state.conversations.filter((c) => c.updatedAt >= todayStart);
  const yesterday = state.conversations.filter(
    (c) => c.updatedAt >= yesterdayStart && c.updatedAt < todayStart
  );
  const earlier = state.conversations.filter(
    (c) => c.updatedAt < yesterdayStart
  );

  if (state.conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-sm text-gray-400">{t("noConversations")}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {today.length > 0 && (
        <ConversationGroup label={t("today")} conversations={today} />
      )}
      {yesterday.length > 0 && (
        <ConversationGroup label={t("yesterday")} conversations={yesterday} />
      )}
      {earlier.length > 0 && (
        <ConversationGroup label={t("earlier")} conversations={earlier} />
      )}
    </div>
  );
}

function ConversationGroup({
  label,
  conversations,
}: {
  label: string;
  conversations: { id: string; title: string; type: string }[];
}) {
  return (
    <div className="mb-3">
      <p className="mb-1 px-2 text-xs font-medium text-gray-400">{label}</p>
      {conversations.map((conv) => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
