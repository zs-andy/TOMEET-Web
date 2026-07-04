"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import Logo from "./Logo";

const SHOW_DEMO_BANNER = false;

export default function Navbar() {
  const t = useTranslations("nav");
  const tBanner = useTranslations("banner");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const newLocale = locale === "zh" ? "en" : "zh";
    const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/";
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  const bannerText = tBanner("text")
    .replace("AI Agent", "AI")
    .replace("AI agents", "AI");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-parchment">
      {SHOW_DEMO_BANNER && (
        <div className="bg-comment-blue text-india-ink text-[14px] h-9 flex items-center justify-center gap-1 px-4 font-bold">
          <span className="truncate">{bannerText}</span>
          <span aria-hidden className="text-[16px] leading-none">→</span>
        </div>
      )}

      <nav className="bg-parchment">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[66px]">
            <Link href="/" className="flex items-center">
              <Logo size={38} />
            </Link>

            <div className="hidden md:flex items-center gap-7 text-[12px] font-semibold text-graphite-warm">
              <Link href="/">{t("home")}</Link>
              <a href="#how">{t("howItWorks")} ↓</a>
              <a href="#access">{t("features")} ↓</a>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={switchLocale}
                className="h-9 px-5 rounded-full bg-[#ded9d2] text-[12px] font-semibold text-india-ink hover:bg-linen transition-colors cursor-pointer"
              >
                {locale === "zh" ? "EN" : "ZH"}
              </button>
              <Link
                href="/login"
                className="h-9 px-5 bg-india-ink text-bone-white text-[12px] font-semibold rounded-full border border-india-ink hover:bg-charcoal-warm transition-colors inline-flex items-center"
              >
                {t("joinWaitlist")}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
