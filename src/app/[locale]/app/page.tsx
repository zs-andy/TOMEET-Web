"use client";

import { useChatContext } from "@/lib/chat/chat-context";
import { ChatArea } from "@/components/app/ChatArea";
import { ProfileBuildingBanner } from "@/components/app/ProfileBuildingBanner";

export default function AppPage() {
  const { state } = useChatContext();

  // If no active conversation and profile not built, show banner
  if (
    !state.activeConversationId &&
    !state.hasCompletedProfile &&
    !state.profileBuildingDismissed
  ) {
    return <ProfileBuildingBanner />;
  }

  return <ChatArea />;
}
