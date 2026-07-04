"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ── Inline rich-text renderer matching Ditto's annotation vocabulary ── */
function renderManifesto(raw: string): ReactNode[] {
  // splits on every tag we support
  const regex = /(<sticker-orange>.*?<\/sticker-orange>|<sticker-yellow>.*?<\/sticker-yellow>|<pill>.*?<\/pill>|<var>.*?<\/var>|<hl>.*?<\/hl>|<em>.*?<\/em>)/g;
  const parts = raw.split(regex);
  return parts.map((part, i) => {
    let m;
    // stacked rotated sticker style
    if ((m = part.match(/^<sticker-orange>(.*?)<\/sticker-orange>$/))) {
      return (
        <span key={i} className="relative inline-block mx-1">
          <span aria-hidden className="absolute -top-[0.15em] left-[0.05em] text-edit-orange/30 font-black italic select-none" style={{ transform: "rotate(-10deg) translateY(-0.12em)" }}>
            {m[1]}
          </span>
          <span aria-hidden className="absolute -top-[0.06em] left-[0.02em] text-edit-orange/50 font-black italic select-none" style={{ transform: "rotate(-5deg) translateY(-0.04em)" }}>
            {m[1]}
          </span>
          <span className="relative z-10 bg-edit-orange text-bone-white font-black italic px-[0.15em]" style={{ transform: "rotate(-2deg)", display: "inline-block" }}>
            {m[1]}
          </span>
        </span>
      );
    }
    // yellow highlight sticker (GREATEST ADVANTAGE style — wedge shape with stacked echoes)
    if ((m = part.match(/^<sticker-yellow>(.*?)<\/sticker-yellow>$/))) {
      return (
        <span key={i} className="relative inline-block mx-1">
          <span aria-hidden className="absolute -top-[0.15em] left-0 text-india-ink/15 font-black italic select-none" style={{ transform: "rotate(-4deg) translateY(-0.12em)" }}>
            {m[1]}
          </span>
          <span aria-hidden className="absolute -top-[0.06em] left-0 text-india-ink/25 font-black italic select-none" style={{ transform: "rotate(-2deg) translateY(-0.04em)" }}>
            {m[1]}
          </span>
          <span className="relative z-10 font-black italic">
            <span className="relative z-10 text-india-ink">{m[1]}</span>
            <span className="absolute inset-x-[-0.15em] bottom-0 h-[55%] bg-marker-yellow -z-0 rounded-sm" style={{ transform: "rotate(-0.5deg)" }} />
          </span>
        </span>
      );
    }
    // inline pill style
    if ((m = part.match(/^<pill>(.*?)<\/pill>$/))) {
      return (
        <span key={i} className="inline-flex items-center mx-1 px-3 py-0.5 rounded-full bg-comment-blue text-bone-white font-black text-[0.65em] uppercase tracking-wide align-middle" style={{ transform: "rotate(-1deg)" }}>
          {m[1]}
        </span>
      );
    }
    // variable tag ({{PERSONALIZE}} style)
    if ((m = part.match(/^<var>(.*?)<\/var>$/))) {
      return (
        <span key={i} className="relative inline-block mx-1">
          <span className="relative z-10 font-black text-india-ink">{`{{${m[1]}}}`}</span>
          <span className="absolute inset-x-[-0.1em] bottom-[0.05em] h-[50%] bg-markup-purple/30 -z-0 rounded-sm" />
        </span>
      );
    }
    // inline highlight (FASTER style — italic + underline color)
    if ((m = part.match(/^<hl>(.*?)<\/hl>$/))) {
      return (
        <span key={i} className="relative inline-block mx-1 font-black italic text-india-ink">
          <span className="relative z-10">{m[1]}</span>
          <span className="absolute inset-x-[-0.1em] bottom-0 h-[40%] bg-marker-yellow -z-0 rounded-sm" style={{ transform: "skewX(-8deg)" }} />
        </span>
      );
    }
    // emphasis (PC Native / Mobile Native)
    if ((m = part.match(/^<em>(.*?)<\/em>$/))) {
      return <em key={i} className="italic font-bold text-india-ink">{m[1]}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * 1:1 Ditto manifesto section:
 * - Left-aligned running text at ~26px, bold
 * - Paragraphs dim to graphite as they scroll away
 * - Rich annotations inline (stacked stickers, pills, highlights)
 * - Transition section: centered "It's time for a Better Way ↓"
 * - Then the subtitle as a centered heading
 */
export default function Manifesto() {
  const t = useTranslations("manifesto");

  const paragraphs = ["p1", "p2", "p3", "p4"] as const;
  const subtitle = t("subtitle");

  return (
    <div className="bg-parchment">
      {/* ── Running text block ── */}
      <div className="max-w-[700px] mx-auto px-6 lg:px-8 pt-24 lg:pt-[140px] pb-16">
        {paragraphs.map((key) => (
          <ManifestoParagraph key={key}>
            {renderManifesto(t.raw(key))}
          </ManifestoParagraph>
        ))}
      </div>

      {/* ── "It's time for a Better Way ↓" transition ── */}
      <div className="max-w-[800px] mx-auto px-6 lg:px-8 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-20%" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* dashed connector */}
          <div className="flex justify-center mb-4">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-india-ink" />
              <span className="w-1.5 h-1.5 rounded-full bg-india-ink" />
              <span className="w-1.5 h-1.5 rounded-full bg-india-ink" />
            </span>
          </div>
          <h2 className="text-[30px] sm:text-[44px] font-bold text-india-ink tracking-[0] leading-tight">
            {(() => {
              const full = t("transition");
              const hl = t("transitionHl");
              const idx = full.indexOf(hl);
              if (idx < 0) return full;
              const before = full.slice(0, idx);
              const after = full.slice(idx + hl.length);
              return (
                <>
                  {before}
                  <span className="relative inline-block">
                    <span className="relative z-10">{hl}</span>
                    <span className="absolute inset-x-[-0.12em] bottom-0 h-[58%] bg-marker-yellow -z-0" />
                  </span>
                  {after}
                </>
              );
            })()}
            <span className="inline-block ml-3 text-india-ink align-middle">▾</span>
          </h2>
        </motion.div>
      </div>

      {subtitle && (
        <div className="max-w-[800px] mx-auto px-6 lg:px-8 pb-24 lg:pb-[100px] text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-15%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-[24px] sm:text-[30px] font-bold text-india-ink tracking-[0] leading-tight"
          >
            {subtitle}
          </motion.h2>
        </div>
      )}
    </div>
  );
}

/* ── Individual paragraph with progressive dim-on-scroll ── */
function ManifestoParagraph({
  children,
}: {
  children: ReactNode;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 65%", "end 20%"],
  });
  // paragraphs dim as they leave the viewport center
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.16, 1, 1, 0.16]);

  return (
    <motion.p
      ref={ref}
      style={{ opacity }}
      className="text-[22px] sm:text-[27px] leading-[1.45] tracking-[0] font-medium text-india-ink mb-10"
    >
      {children}
    </motion.p>
  );
}
