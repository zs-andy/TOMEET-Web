"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import ComingSoonModal from "./ComingSoonModal";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <a href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 tracking-tight">Rendez</span>
              <span className="text-xs text-gray-400 font-medium">赴野</span>
            </a>

            <div className="flex items-center gap-5">
              <button
                onClick={switchLocale}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer font-medium"
              >
                {locale === "zh" ? "EN" : "中文"}
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {t("joinWaitlist")}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <ComingSoonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
