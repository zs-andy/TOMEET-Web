"use client";

import { useChatStore } from "@/lib/chat/chat-context";
import { ChatArea } from "@/components/app/ChatArea";
import { ProfileBuildingBanner } from "@/components/app/ProfileBuildingBanner";

export default function AppPage() {
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const hasCompletedProfile = useChatStore((s) => s.hasCompletedProfile);
  const profileBuildingDismissed = useChatStore((s) => s.profileBuildingDismissed);

  if (!activeConversationId && !hasCompletedProfile && !profileBuildingDismissed) {
    return <ProfileBuildingBanner />;
  }

  return <ChatArea />;
}
