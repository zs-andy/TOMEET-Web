"use client";

import { ArrowLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function MobileBackButton() {
  const locale = useLocale();
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const homePath = locale === "en" ? "/en" : "/";
  const isHome = pathname === "/" || pathname === "/en" || pathname === "/zh";

  if (isHome) return null;

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(homePath);
  };

  return (
    <button
      type="button"
      className="mobile-back-button"
      onClick={goBack}
      aria-label={nav("back")}
    >
      <ArrowLeft size={20} strokeWidth={1.8} aria-hidden="true" />
    </button>
  );
}
