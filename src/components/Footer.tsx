"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Logo from "./Logo";

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path === "/" ? "" : path}` : path;
}

export default function Footer() {
  const footer = useTranslations("footer");
  const nav = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="site-footer">
      <div className="footer-grid page-grid">
        <div className="footer-brand">
          <Logo size={42} inverse />
          <p>{footer("tagline")}</p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h3>{footer("product")}</h3>
            <a href="#why">{nav("features")}</a>
            <a href="#how">{nav("howItWorks")}</a>
            <Link href={localizedHref(locale, "/agent")}>
              {nav("joinWaitlist")}
            </Link>
          </div>
          <div className="footer-column">
            <h3>{footer("company")}</h3>
            <span>{footer("about")}</span>
            <span>{footer("blog")}</span>
            <span>{footer("careers")}</span>
          </div>
          <div className="footer-column">
            <h3>{footer("legal")}</h3>
            <span>{footer("privacy")}</span>
            <span>{footer("terms")}</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom page-grid">
        <span>{footer("copyright")}</span>
        <span>TOMEET · AI Native Social</span>
      </div>
    </footer>
  );
}
