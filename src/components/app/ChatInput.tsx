"use client";

import { useState, useRef, type FormEvent } from "react";
import { ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";

export function ChatInput() {
  const t = useTranslations("app");
  const [value, setValue] = useState("");
  const { state, sendMessage } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || state.isAgentTyping) return;
    sendMessage(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    textareaRef.current?.focus();
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
    <div className="bg-gray-50 px-4 pb-4 pt-2">
      <div className="mx-auto max-w-3xl md:px-4">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-end rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:border-gray-300"
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
              disabled={!value.trim() || state.isAgentTyping}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white transition-all hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400"
              aria-label={t("send")}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-gray-400">
          Rendez Agent · 帮你找到对的人
        </p>
      </div>
    </div>
  );
}
