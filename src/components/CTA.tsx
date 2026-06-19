"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import ComingSoonModal from "./ComingSoonModal";

export default function CTA() {
  const t = useTranslations("cta");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div id="waitlist" className="max-w-4xl mx-auto px-6 lg:px-8 py-24 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
        >
          {t("title")}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mt-4 text-lg text-gray-500 max-w-md mx-auto leading-relaxed"
        >
          {t("subtitle")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-8"
        >
          <button
            onClick={() => setModalOpen(true)}
            className="inline-block px-8 py-3.5 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors text-base cursor-pointer"
          >
            {t("button")}
          </button>
        </motion.div>
      </div>
      <ComingSoonModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
