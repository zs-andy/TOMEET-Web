"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { renderHighlight } from "./Highlight";
import ImagePlaceholder from "./ImagePlaceholder";

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path}` : path;
}

export default function CTA() {
  const landing = useTranslations("landing");
  const cta = useTranslations("cta");
  const trust = useTranslations("trust");
  const locale = useLocale();
  const interests = trust.raw("items") as string[];

  return (
    <section id="access" className="cta-section">
      <div className="page-grid">
        <span className="eyebrow">{landing("ctaKicker")}</span>
        <h2 className="cta-heading editorial-title">
          {renderHighlight(cta.raw("title"), ["orange"])}
        </h2>

        <div className="meet-gallery">
          {interests.map((interest, index) => (
            <article className="meet-tile" key={interest}>
              <ImagePlaceholder
                index={`${index + 9}`.padStart(2, "0")}
                ratio="square"
                label={`${landing("communityVisual")} · ${interest}`}
              />
              <p>{interest}</p>
            </article>
          ))}
        </div>

        <div className="cta-copy">
          <p>{cta("subtitle")}</p>
          <Link
            className="primary-button"
            href={localizedHref(locale, "/login")}
          >
            {cta("button")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
