"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { renderHighlight } from "./Highlight";

export default function Hero() {
  const t = useTranslations("hero");
  const tTrust = useTranslations("trust");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const interests = tTrust.raw("items") as string[];

  return (
    <section
      ref={ref}
      className="flex min-h-screen flex-col px-6 lg:px-8 bg-parchment relative pt-[112px] lg:pt-[140px] pb-16 overflow-hidden"
    >
      <motion.div
        style={{ y, opacity }}
        className="max-w-[1200px] mx-auto text-center relative w-full"
      >
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-[980px] text-[44px] sm:text-[72px] lg:text-[96px] font-bold text-india-ink leading-[1.18] tracking-[0]"
        >
          {renderHighlight(
            t.raw("title"),
            locale === "zh" ? ["orange", "yellow"] : ["yellow", "orange"],
            { yellow: t("tag"), orange: t("matchTag") }
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-[18px] sm:text-[20px] leading-[1.35] text-graphite-warm max-w-2xl mx-auto font-medium"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex items-center justify-center gap-7"
        >
          <Link
            href="/login"
            className="h-10 px-5 bg-india-ink text-bone-white text-[13px] font-semibold rounded-full border border-india-ink hover:bg-charcoal-warm transition-colors inline-flex items-center gap-2"
          >
            {t("cta")}
            <span aria-hidden>→</span>
          </Link>
          <a
            href="#how"
            className="text-[13px] font-semibold text-graphite-warm inline-flex items-center gap-1.5 group"
          >
            {t("seeHow")}
            <span
              aria-hidden
              className="text-linen group-hover:translate-x-0.5 transition-transform"
            >
              →
            </span>
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mt-auto pt-16 max-w-[1200px] mx-auto w-full"
      >
        <div className="flex items-center justify-center gap-x-12 gap-y-4 flex-wrap">
          {interests.map((it) => (
            <span
              key={it}
              className="text-[17px] font-bold uppercase tracking-[0] text-graphite-warm"
            >
              {it}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
