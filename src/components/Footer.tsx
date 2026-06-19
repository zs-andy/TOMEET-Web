"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-tight">Rendez</span>
            <span className="text-xs text-zinc-500">赴野</span>
          </div>
          <p className="text-xs text-zinc-500">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
