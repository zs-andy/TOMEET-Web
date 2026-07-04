"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Link from "next/link";
import { renderHighlight } from "./Highlight";

export default function CTA() {
  const t = useTranslations("cta");

  return (
    <div id="access" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-24 lg:py-[130px] text-center bg-parchment">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-[38px] sm:text-[56px] font-bold text-india-ink leading-tight tracking-[0]"
      >
        {renderHighlight(t.raw("title"), ["blue"])}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.05 }}
        className="mt-5 text-[18px] text-graphite-warm max-w-xl mx-auto font-medium leading-relaxed"
      >
        {t("subtitle")}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: "-100px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="mt-10"
      >
        <Link
          href="/login"
          className="inline-flex h-11 items-center rounded-full border border-india-ink bg-india-ink px-7 text-[13px] font-semibold text-bone-white transition-colors hover:bg-charcoal-warm"
        >
          {t("button")}
        </Link>
      </motion.div>
    </div>
  );
}
