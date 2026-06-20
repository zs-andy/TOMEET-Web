"use client";

import { SidebarHeader } from "./SidebarHeader";
import { ConversationList } from "./ConversationList";
import { UserMenu } from "./UserMenu";

export function AppSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col bg-gray-50 border-r border-gray-200/80">
      <SidebarHeader />
      <ConversationList />
      <UserMenu />
    </aside>
  );
}
