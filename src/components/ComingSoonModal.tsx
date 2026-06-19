"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({ open, onClose }: Props) {
  const t = useTranslations("modal");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 shadow-xl max-w-sm w-[calc(100%-3rem)] text-center"
          >
            <p className="text-2xl font-bold text-gray-900">{t("comingSoon")}</p>
            <p className="mt-3 text-gray-500 leading-relaxed">{t("comingSoonDesc")}</p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors text-sm cursor-pointer"
            >
              {t("close")}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
