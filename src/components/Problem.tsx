"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

export default function Problem() {
  const t = useTranslations("problem");
  const oldItems = t.raw("oldWayItems") as string[];
  const newItems = t.raw("newWayItems") as string[];

  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-50">
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

      <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
        {/* Old way */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-8 border border-gray-200"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-6">
            {t("oldWay")}
          </p>
          <ul className="space-y-4">
            {oldItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-gray-600 text-[15px]">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* New way */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 border-2 border-gray-900 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900" />
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-900 mb-6">
            {t("newWay")}
          </p>
          <ul className="space-y-4">
            {newItems.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-900 text-[15px] font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
