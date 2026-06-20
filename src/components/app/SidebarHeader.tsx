"use client";

import { Plus, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";

export function SidebarHeader() {
  const t = useTranslations("app");
  const { state, createChat } = useChatContext();

  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-gray-900">Rendez</span>
      </div>
      <button
        onClick={() => createChat("matching")}
        className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" />
        {t("newChat")}
      </button>
      {!state.hasCompletedProfile && state.profileBuildingDismissed && (
        <button
          onClick={() => createChat("profile_building")}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          <User className="h-4 w-4" />
          {t("profileBuildingSidebar")}
        </button>
      )}
    </div>
  );
}
