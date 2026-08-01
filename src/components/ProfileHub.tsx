"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path}` : path;
}

export default function ProfileHub() {
  const t = useTranslations("profile");
  const locale = useLocale();

  return (
    <main className="simple-profile-shell">
      <header className="simple-profile-header">
        <Link href={localizedHref(locale, "") || "/"} aria-label={t("backToHome")}>
          <Logo size={29} />
        </Link>
        <form action={`/api/auth/signout?locale=${locale}`} method="post">
          <button type="submit" className="simple-profile-logout">
            <LogOut aria-hidden="true" />
            {t("logout")}
          </button>
        </form>
      </header>
      <div className="simple-profile-empty" aria-hidden="true" />
    </main>
  );
}
