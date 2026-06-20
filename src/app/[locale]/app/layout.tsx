"use client";

import { ChatProvider } from "@/lib/chat/chat-context";
import { AppSidebar } from "@/components/app/AppSidebar";
import { MobileDrawer } from "@/components/app/MobileDrawer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>
        {/* Mobile drawer */}
        <MobileDrawer />
        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </ChatProvider>
  );
}
