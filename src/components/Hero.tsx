"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import ChatDemo from "./ChatDemo";

function renderHighlight(text: string) {
  const parts = text.split(/(<highlight>.*?<\/highlight>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<highlight>(.*?)<\/highlight>$/);
    if (match) {
      return (
        <span
          key={i}
          className="relative inline-block"
        >
          <span className="relative z-10">{match[1]}</span>
          <span className="absolute inset-x-0 bottom-0 h-[40%] bg-orange-300/40 -z-0 rounded-sm" />
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Hero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="min-h-screen flex flex-col items-center justify-center pt-14 pb-12 px-6 lg:px-8 bg-white relative">
      <motion.div style={{ y, opacity }} className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-tight tracking-tight"
        >
          {t("title")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
        >
          {renderHighlight(t.raw("subtitle"))}
        </motion.p>
      </motion.div>

      {/* Demo immediately visible below headline */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-12 w-full max-w-5xl mx-auto"
      >
        <ChatDemo />
      </motion.div>
    </section>
  );
}
