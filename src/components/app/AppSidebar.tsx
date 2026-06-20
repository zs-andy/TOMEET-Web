"use client";

import { SidebarHeader } from "./SidebarHeader";
import { ConversationList } from "./ConversationList";
import { UserMenu } from "./UserMenu";

export function AppSidebar() {
  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-white">
      <SidebarHeader />
      <ConversationList />
      <UserMenu />
    </aside>
  );
}
