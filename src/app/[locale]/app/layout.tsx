"use client";

import { ChatProvider } from "@/lib/chat/chat-context";
import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileDrawer } from "@/components/app/MobileDrawer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-white">
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        <MobileDrawer />
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </ChatProvider>
  );
}
