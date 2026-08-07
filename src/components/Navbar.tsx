"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { AuthViewer } from "@/lib/auth";
import { FOODIES_ENABLED } from "@/lib/feature-flags";
import Logo from "./Logo";

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path === "/" ? "" : path}` : path;
}

function getInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "Y";
}

export default function Navbar({ viewer }: { viewer: AuthViewer | null }) {
  const nav = useTranslations("nav");
  const locale = useLocale();
  const avatarStyle = viewer?.avatarUrl
    ? { backgroundImage: `url(${JSON.stringify(viewer.avatarUrl)})` }
    : undefined;

  return (
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
          {FOODIES_ENABLED ? (
            <Link className="home-foodies-link" href={localizedHref(locale, "/foodies")}>
              {nav("foodies")} ↗
            </Link>
          ) : null}
          <Link
            href={locale === "zh" ? "/en" : "/"}
            hrefLang={locale === "zh" ? "en" : "zh"}
            className="locale-button"
            aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
          >
            {locale === "zh" ? "EN" : "中文"}
          </Link>
          {viewer ? (
            <Link
              href={localizedHref(locale, "/profile")}
              className="user-avatar"
              aria-label={nav("openProfile")}
              title={viewer.label}
            >
              <span
                className={`user-avatar-image${viewer.avatarUrl ? " has-image" : ""}`}
                style={avatarStyle}
                aria-hidden="true"
              >
                {!viewer.avatarUrl && getInitial(viewer.label)}
              </span>
            </Link>
          ) : (
            <Link
              href={localizedHref(locale, "/agent")}
              className="login-button"
            >
              {nav("joinWaitlist")}
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
