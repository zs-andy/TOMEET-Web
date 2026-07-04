"use client";

import { useTranslations } from "next-intl";
import Logo from "./Logo";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-bone-white">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
          <Logo size={46} />
          <p className="text-[12px] font-bold text-graphite-warm">{t("copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
