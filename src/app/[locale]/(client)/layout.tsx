"use client";

import AppSidebar from "@/app/layout/default/Sidebar";
import AppNavbar from "@/app/layout/default/Navbar";
import GlobalVideoCall from "./chat/components/GlobalVideoCall";
import { ChatBoxManager } from "./chat/components/ChatBoxManager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-col h-screen overflow-hidden">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto md:ml-[20%] bg-gray-50">
            {children}
            <GlobalVideoCall />
          </main>
        </div>
      </div>

      <ChatBoxManager />
    </div>
  );
}
