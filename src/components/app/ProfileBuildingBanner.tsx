"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatStore } from "@/lib/chat/chat-context";

export function ProfileBuildingBanner() {
  const t = useTranslations("app");
  const { hasCompletedProfile, profileBuildingDismissed, createChat, dismissProfileBuilding } = useChatStore();

  if (hasCompletedProfile || profileBuildingDismissed) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-sm text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gray-100 p-4">
            <Sparkles className="h-8 w-8 text-gray-700" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t("profileBuilding")}
        </h2>
        <p className="mb-8 text-sm text-gray-500">
          {t("profileBuildingDesc")}
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => createChat("profile_building")}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            {t("profileBuildingStart")}
          </button>
          <button
            onClick={() => dismissProfileBuilding()}
            className="w-full rounded-xl px-6 py-3 text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            {t("profileBuildingDismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}
