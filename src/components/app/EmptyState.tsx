"use client";

import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";
import { ArrowUp } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";

export function EmptyState() {
  const t = useTranslations("app");
  const { createChat, sendMessage, state } = useChatContext();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "我想找人一起周末去爬山",
    "帮我找一个对 AI 感兴趣的设计师",
    "有没有人想一起组队黑客松",
    "推荐周五晚上适合小聚的地方",
  ];

  const handleSuggestion = (text: string) => {
    createChat("matching", text.slice(0, 20));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    createChat("matching", trimmed.slice(0, 20));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex h-full flex-col items-center justify-center px-5 md:px-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-center text-2xl font-semibold text-gray-900 mb-8">
          {t("emptyStateTitle")}
        </h1>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end rounded-2xl border border-gray-200 bg-white mb-4"
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              handleInput();
            }}
            onKeyDown={handleKeyDown}
            placeholder={t("inputPlaceholder")}
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            style={{ maxHeight: 160 }}
          />
          <div className="p-2">
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400"
              aria-label={t("send")}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSuggestion(s)}
              className="rounded-full border border-gray-200 px-3.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50 hover:border-gray-300"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
