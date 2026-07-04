"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";

export default function HowItWorks() {
  const t = useTranslations("howItWorks");
  const [active, setActive] = useState(0);

  const steps = [
    { num: "01", key: "step1" },
    { num: "02", key: "step2" },
    { num: "03", key: "step3" },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight"
        >
          {t("title")}
        </motion.h2>
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid lg:grid-cols-[280px_1fr] gap-8 lg:gap-12"
        >
          {/* Left: step tabs */}
          <div className="flex lg:flex-col gap-2">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => setActive(i)}
                className={`text-left px-4 py-3 rounded-lg transition-all cursor-pointer w-full ${
                  active === i
                    ? "bg-gray-100 border-l-[3px] border-gray-900"
                    : "border-l-[3px] border-transparent hover:bg-gray-50"
                }`}
              >
                <span className={`text-xs font-medium ${active === i ? "text-gray-900" : "text-gray-400"}`}>
                  {step.num}
                </span>
                <p className={`text-sm font-semibold mt-0.5 ${active === i ? "text-gray-900" : "text-gray-500"}`}>
                  {t(`${step.key}Title`)}
                </p>
              </button>
            ))}
          </div>

          {/* Right: content card */}
          <div className="border border-gray-200 rounded-2xl p-8 lg:p-10 bg-gray-50/50 min-h-[200px] flex items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t(`${steps[active].key}Title`)}
              </h3>
              <p className="text-gray-500 text-base leading-relaxed">
                {t(`${steps[active].key}Desc`)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
