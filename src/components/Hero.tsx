"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

function localizedHref(locale: string, path: string) {
  return locale === "zh" ? `/zh${path}` : path;
}

export default function Hero() {
  const landing = useTranslations("landing");
  const hero = useTranslations("hero");
  const locale = useLocale();
  const isChinese = locale === "zh";

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-grid page-grid">
        <h1 id="hero-title" className="sr-only">
          {landing("heroUnderstand")} {landing("heroYou")} {landing("heroAre")} {landing("heroThen")} {landing("heroSocial")}
        </h1>

        {isChinese ? (
          <p
            className="hero-word hero-word-zh-understand"
            aria-hidden="true"
          >
            <span>{landing("heroUnderstand")}</span>
            <span>{landing("heroAre")}</span>
          </p>
        ) : (
          <>
            <p className="hero-word hero-word-learns" aria-hidden="true">
              {landing("heroUnderstand")}
            </p>
            <div className="hero-word hero-word-identity" aria-hidden="true">
              <span>{landing("heroYou")}</span>
              <span>{landing("heroAre")}</span>
            </div>
          </>
        )}

        <div className="hero-core">
          <p className="hero-core-title">
            {landing("heroBridgeBefore")}
            <span className="soft-highlight">{landing("heroBridgeHighlight")}</span>
            {landing("heroBridgeAfter")}
          </p>
          <div className="hero-actions">
            <Link
              href={localizedHref(locale, "/login")}
              className="primary-button"
            >
              {hero("cta")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {isChinese ? (
          <p className="hero-word hero-word-zh-connect" aria-hidden="true">
            <span className="hero-connect-line">{landing("heroThen")}</span>
            <span className="hero-connect-line">{landing("heroSocial")}</span>
          </p>
        ) : (
          <p className="hero-word hero-word-connect" aria-hidden="true">
            <span className="hero-connect-line">{landing("heroThen")}</span>
            <span className="hero-connect-line">{landing("heroSocial")}</span>
          </p>
        )}
      </div>
    </section>
  );
}
