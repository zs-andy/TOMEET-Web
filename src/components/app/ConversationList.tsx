"use client";

import { useTranslations } from "next-intl";
import { useChatStore } from "@/lib/chat/chat-context";
import { ConversationItem } from "./ConversationItem";

export function ConversationList() {
  const t = useTranslations("app");
  const conversations = useChatStore((s) => s.conversations);

  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - 86400000;

  const today = conversations.filter((c) => c.updatedAt >= todayStart);
  const yesterday = conversations.filter(
    (c) => c.updatedAt >= yesterdayStart && c.updatedAt < todayStart
  );
  const earlier = conversations.filter(
    (c) => c.updatedAt < yesterdayStart
  );

  if (conversations.length === 0) {
    return null;
  }

  return (
    <nav className="flex-1 overflow-y-auto px-2">
      {today.length > 0 && (
        <ConversationGroup label={t("today")} conversations={today} />
      )}
      {yesterday.length > 0 && (
        <ConversationGroup label={t("yesterday")} conversations={yesterday} />
      )}
      {earlier.length > 0 && (
        <ConversationGroup label={t("earlier")} conversations={earlier} />
      )}
    </nav>
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
    <div className="mb-1">
      <p className="px-3 pt-4 pb-1 text-xs text-gray-400">
        {label}
      </p>
      <div className="space-y-0.5">
        {conversations.map((conv) => (
          <ConversationItem key={conv.id} conversation={conv} />
        ))}
      </div>
    </div>
  );
}
