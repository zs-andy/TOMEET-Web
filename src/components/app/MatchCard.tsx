"use client";

import { MatchInfo } from "@/lib/chat/types";

type Props = {
  match: MatchInfo;
};

export function MatchCard({ match }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-orange-50 p-3 border border-orange-100">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-medium">
        {match.avatarInitial}
      </div>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-sm">{match.name}</p>
        <p className="text-xs text-gray-500 truncate">{match.description}</p>
      </div>
    </div>
  );
}
