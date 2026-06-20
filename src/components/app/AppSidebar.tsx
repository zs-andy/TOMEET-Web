"use client";

import { SidebarHeader } from "./SidebarHeader";
import { ConversationList } from "./ConversationList";
import { UserMenu } from "./UserMenu";

export function AppSidebar() {
  return (
    <aside className="flex h-full w-60 flex-col bg-gray-100/70">
      <SidebarHeader />
      <ConversationList />
      <UserMenu />
    </aside>
  );
}
