"use client";

import { MatchInfo } from "@/lib/chat/types";

type Props = {
  match: MatchInfo;
};

export function MatchCard({ match }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white text-sm font-medium">
        {match.avatarInitial}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-sm">{match.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{match.description}</p>
      </div>
    </div>
  );
}
