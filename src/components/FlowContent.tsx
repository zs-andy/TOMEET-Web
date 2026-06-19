"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

function renderHighlight(text: string) {
  const parts = text.split(/(<highlight>.*?<\/highlight>)/g);
  return parts.map((part, i) => {
    const match = part.match(/^<highlight>(.*?)<\/highlight>$/);
    if (match) {
      return (
        <span key={i} className="relative inline-block">
          <span className="relative z-10">{match[1]}</span>
          <span className="absolute inset-x-0 bottom-0 h-[40%] bg-orange-300/40 -z-0 rounded-sm" />
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function FlowContent() {
  const tHow = useTranslations("howItWorks");
  const tFeatures = useTranslations("features");

  const steps = [
    { num: "01", titleKey: "step1Title", descKey: "step1Desc", featureDesc: "feature1Desc" },
    { num: "02", titleKey: "step2Title", descKey: "step2Desc", featureDesc: "feature2Desc" },
    { num: "03", titleKey: "step3Title", descKey: "step3Desc", featureDesc: "feature3Desc" },
  ];

  return (
    <div className="bg-white">
      <div className="min-h-screen flex flex-col justify-center max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight text-center"
        >
          {tHow("title")}
        </motion.h2>

        <div className="mt-16 space-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-6"
            >
              <span className="text-3xl font-bold text-orange-500/30 leading-none mt-1 flex-shrink-0">
                {step.num}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {tHow(step.titleKey)}
                </h3>
                <p className="mt-1.5 text-gray-500 leading-relaxed">
                  {renderHighlight(tHow.raw(step.descKey))}
                </p>
                <p className="mt-1 text-gray-400 text-sm leading-relaxed">
                  {tFeatures(step.featureDesc)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
