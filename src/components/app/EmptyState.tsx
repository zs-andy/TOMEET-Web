"use client";

import { MessageSquare, Compass, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useChatContext } from "@/lib/chat/chat-context";

export function EmptyState() {
  const t = useTranslations("app");
  const { createChat } = useChatContext();

  const suggestions = [
    { icon: Compass, text: "我想找人一起周末去爬山", type: "matching" as const },
    { icon: Users, text: "帮我找一个对 AI 感兴趣的设计师", type: "matching" as const },
    { icon: MessageSquare, text: "有没有人想一起组队黑客松", type: "matching" as const },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-orange-100 p-4">
            <MessageSquare className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">
          {t("emptyStateTitle")}
        </h2>
        <p className="mb-8 text-sm text-gray-500">{t("emptyStateSubtitle")}</p>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => {
                createChat(s.type, s.text.slice(0, 20));
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:border-orange-200"
            >
              <s.icon className="h-4 w-4 shrink-0 text-gray-400" />
              {s.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
