"use client";

import { useTranslations } from "next-intl";

function stripMarkup(text: string) {
  return text.replace(/<[^>]+>/g, "");
}

export default function Manifesto() {
  const landing = useTranslations("landing");
  const manifesto = useTranslations("manifesto");

  return (
    <section id="why" className="manifesto-section">
      <div className="manifesto-intro page-grid">
        <h2 className="manifesto-heading editorial-title">
          {landing("manifestoTitle")}
        </h2>

        <div className="manifesto-copy">
          <p>{stripMarkup(manifesto.raw("p1"))}</p>
          <p>{stripMarkup(manifesto.raw("p3"))}</p>
          <p>{stripMarkup(manifesto.raw("p4"))}</p>
        </div>
      </div>
    </section>
  );
}
