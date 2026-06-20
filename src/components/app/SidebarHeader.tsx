"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";

export function SidebarHeader() {
  const t = useTranslations("app");
  const { createChat } = useChatContext();

  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-sm font-semibold text-gray-900">Rendez</span>
      <button
        onClick={() => createChat("matching")}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-200/60"
        aria-label={t("newChat")}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
