"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export function UserMenu() {
  const t = useTranslations("app");

  return (
    <div className="border-t border-gray-200/80 p-3">
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <LogOut className="h-4 w-4" />
          {t("signOut")}
        </button>
      </form>
    </div>
  );
}
