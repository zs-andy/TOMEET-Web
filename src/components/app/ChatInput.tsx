"use client";

import { useState, useRef, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";

export function ChatInput() {
  const t = useTranslations("app");
  const [value, setValue] = useState("");
  const { state, sendMessage } = useChatContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || state.isAgentTyping) return;
    sendMessage(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-2xl items-end gap-2"
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("inputPlaceholder")}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
        <button
          type="submit"
          disabled={!value.trim() || state.isAgentTyping}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white transition-colors hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label={t("send")}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
