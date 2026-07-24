"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";

function localizedHref(locale: string, path: string) {
  return locale === "zh" ? `/zh${path === "/" ? "" : path}` : path;
}

export default function Navbar() {
  const nav = useTranslations("nav");
  const banner = useTranslations("banner");
  const locale = useLocale();

  return (
    <>
      <header className="site-header">
        <div className="announcement-bar">
          <span className="announcement-dot" aria-hidden="true" />
          <span>{banner("text")}</span>
          <span aria-hidden="true">→</span>
        </div>
      </header>

      <div className="site-nav-wrap">
        <nav className="site-nav page-grid" aria-label="Primary navigation">
          <Link
            href={localizedHref(locale, "/")}
            className="brand-home"
            aria-label="TOMEET home"
          >
            <Logo size={34} />
          </Link>

          <div
            className="nav-link-group"
            style={{
              border: 0,
              borderRadius: 0,
              background: "transparent",
              boxShadow: "none",
              outline: "none",
            }}
          >
            <a className="nav-link" href="#why">
              {nav("features")}
            </a>
          </div>

          <div
            className="nav-actions"
            style={{
              border: 0,
              borderRadius: 0,
              background: "transparent",
              boxShadow: "none",
              outline: "none",
            }}
          >
            <Link
              href={locale === "zh" ? "/" : "/zh"}
              hrefLang={locale === "zh" ? "en" : "zh"}
              className="locale-button"
              aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
            >
              {locale === "zh" ? "EN" : "中文"}
            </Link>
            <Link
              href={localizedHref(locale, "/login")}
              className="login-button"
            >
              {nav("joinWaitlist")}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
