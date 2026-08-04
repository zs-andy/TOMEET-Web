"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path}` : path;
}

export default function Hero() {
  const landing = useTranslations("landing");
  const access = useTranslations("access");
  const locale = useLocale();
  const isChinese = locale === "zh";

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-grid page-grid">
        <h1 id="hero-title" className="sr-only">
          {landing("heroUnderstand")} {landing("heroYou")} {landing("heroAre")} {landing("heroThen")} {landing("heroSocial")}
        </h1>

        <div className="hero-headline">
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

        <div className="hero-core">
          <div className="hero-access-choices">
            <Link
              className="primary-button web-access-button"
              href={localizedHref(locale, "/login")}
            >
              {access("tryNow")}
            </Link>
          </div>
          <p className="hero-core-title">
            {landing("heroBridgeBefore")}
            <span className="hero-ai-native-anchor">
              {isChinese ? (
                <strong className="hero-ai-native-arrow hero-ai-native-arrow--before" aria-hidden="true">↑</strong>
              ) : null}
              <span className="soft-highlight">{landing("heroBridgeHighlight")}</span>
              {!isChinese ? (
                <>
                  {" "}
                  <strong className="hero-ai-native-arrow hero-ai-native-arrow--after" aria-hidden="true">↑</strong>
                </>
              ) : null}
            </span>
            {landing("heroBridgeAfter")}
          </p>
        </div>
      </div>
    </section>
  );
}
