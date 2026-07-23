"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import ImagePlaceholder from "./ImagePlaceholder";

function localizedHref(locale: string, path: string) {
  return locale === "zh" ? `/zh${path}` : path;
}

export default function Hero() {
  const landing = useTranslations("landing");
  const hero = useTranslations("hero");
  const locale = useLocale();
  const isChinese = locale === "zh";
  const socialPhrase = landing("heroSocial");
  const socialLastSpace = socialPhrase.lastIndexOf(" ");
  const socialPhraseBeforeImage = socialPhrase.slice(0, socialLastSpace);
  const socialPhraseAfterImage = socialPhrase.slice(socialLastSpace + 1);

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
              <div className="hero-image-slot hero-image-slot--portrait">
                {"("}
                <span className="hero-image-slot-gap" />
                {")"}
                <ImagePlaceholder
                  index="01"
                  ratio="landscape"
                  label={landing("heroPortrait")}
                  className="hero-figure hero-image-slot-visual"
                />
              </div>
              <span>{landing("heroAre")}</span>
            </div>
          </>
        )}

        {isChinese && (
          <div className="hero-figure-group hero-portrait">
            <span className="hero-figure-parenthesis" aria-hidden="true">(</span>
            <ImagePlaceholder
              index="01"
              ratio="landscape"
              label={landing("heroPortrait")}
              className="hero-figure"
            />
            <span className="hero-figure-parenthesis" aria-hidden="true">)</span>
          </div>
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
          <>
            <div className="hero-figure-group hero-agent">
              <span className="hero-figure-parenthesis" aria-hidden="true">(</span>
              <ImagePlaceholder
                index="02"
                ratio="landscape"
                label={landing("heroAgent")}
                className="hero-figure"
              />
              <span className="hero-figure-parenthesis" aria-hidden="true">)</span>
            </div>
            <p className="hero-word hero-word-zh-connect" aria-hidden="true">
              {landing("heroThen")}{landing("heroSocial")}
            </p>
          </>
        ) : (
          <div className="hero-word hero-word-connect" aria-hidden="true">
            <span className="hero-connect-line">{landing("heroThen")}</span>
            <div className="hero-connect-line hero-connect-line--with-figure">
              <span>{socialPhraseBeforeImage}</span>
              <div className="hero-image-slot hero-image-slot--agent">
                {"("}
                <span className="hero-image-slot-gap" />
                {")"}
                <ImagePlaceholder
                  index="02"
                  ratio="landscape"
                  label={landing("heroAgent")}
                  className="hero-figure hero-image-slot-visual"
                />
              </div>
              <span>{socialPhraseAfterImage}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
