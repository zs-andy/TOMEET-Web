"use client";

import { Compass, Users, MessageSquare, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";

export function EmptyState() {
  const t = useTranslations("app");
  const { createChat } = useChatContext();

  const suggestions = [
    { icon: Compass, text: "我想找人一起周末去爬山" },
    { icon: Users, text: "帮我找一个对 AI 感兴趣的设计师" },
    { icon: MessageSquare, text: "有没有人想一起组队黑客松" },
    { icon: Sparkles, text: "推荐周五晚上适合小聚的地方" },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-2xl">
        {/* Greeting */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {t("emptyStateTitle")}
          </h1>
          <p className="text-sm text-gray-500">
            {t("emptyStateSubtitle")}
          </p>
        </div>

        {/* Suggestion grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => createChat("matching", s.text.slice(0, 20))}
              className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-left transition-all hover:bg-gray-50 hover:border-gray-300"
            >
              <s.icon className="h-5 w-5 shrink-0 text-gray-400 mt-0.5 group-hover:text-gray-600 transition-colors" />
              <span className="text-sm text-gray-700 leading-relaxed">{s.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
