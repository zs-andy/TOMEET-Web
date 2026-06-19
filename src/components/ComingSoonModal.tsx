"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
}

type FormState = "idle" | "loading" | "success" | "error";

export default function ComingSoonModal({ open, onClose }: Props) {
  const t = useTranslations("modal");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorKey, setErrorKey] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const resetForm = () => {
    setFormState("idle");
    setErrorKey("");
    setName("");
    setEmail("");
    setNote("");
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetForm, 200);
  };

  const validate = (): string | null => {
    if (!name.trim()) return "errorNameRequired";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) return "errorEmailInvalid";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setErrorKey(validationError);
      setFormState("error");
      return;
    }

    setFormState("loading");
    setErrorKey("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), note: note.trim() || undefined }),
      });

      if (res.status === 201) {
        setFormState("success");
      } else if (res.status === 409) {
        setErrorKey("errorAlreadyExists");
        setFormState("error");
      } else if (res.status === 400) {
        const data = await res.json();
        if (data.error === "name_required") setErrorKey("errorNameRequired");
        else setErrorKey("errorEmailInvalid");
        setFormState("error");
      } else {
        setErrorKey("errorServer");
        setFormState("error");
      }
    } catch {
      setErrorKey("errorServer");
      setFormState("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 shadow-xl max-w-md w-[calc(100%-2rem)]"
          >
            {formState === "success" ? (
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{t("successTitle")}</p>
                <p className="mt-3 text-gray-500 leading-relaxed">{t("successDesc")}</p>
                <button
                  onClick={handleClose}
                  className="mt-6 px-6 py-2.5 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors text-sm cursor-pointer"
                >
                  {t("close")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold text-gray-900 text-center">{t("title")}</h2>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="waitlist-name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("nameLabel")}
                    </label>
                    <input
                      id="waitlist-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("namePlaceholder")}
                      disabled={formState === "loading"}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="waitlist-email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("emailLabel")}
                    </label>
                    <input
                      id="waitlist-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                      disabled={formState === "loading"}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label htmlFor="waitlist-note" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("noteLabel")}
                    </label>
                    <textarea
                      id="waitlist-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t("notePlaceholder")}
                      disabled={formState === "loading"}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-colors disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>

                {formState === "error" && errorKey && (
                  <p className="mt-3 text-sm text-red-600">{t(errorKey)}</p>
                )}

                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="mt-6 w-full py-3 bg-orange-500 text-white font-medium rounded-full hover:bg-orange-600 transition-colors text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {formState === "loading" ? t("submitting") : t("submit")}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
