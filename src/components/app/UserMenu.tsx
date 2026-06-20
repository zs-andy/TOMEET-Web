"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

export function UserMenu() {
  const t = useTranslations("app");

  return (
    <div className="border-t border-gray-100 p-4">
      <form action="/api/auth/signout" method="POST">
        <button
          type="submit"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          {t("signOut")}
        </button>
      </form>
    </div>
  );
}
