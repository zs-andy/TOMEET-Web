"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Features() {
  const t = useTranslations("features");

  const features = [
    { key: "feature1" },
    { key: "feature2" },
    { key: "feature3" },
  ];

  return (
    <section id="features" className="py-24 px-6 lg:px-8 bg-gray-50">
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

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-orange-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-5">
              <span className="text-orange-500 font-bold text-sm">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t(`${f.key}Title`)}
            </h3>
            <p className="text-gray-500 text-[15px] leading-relaxed">
              {t(`${f.key}Desc`)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
