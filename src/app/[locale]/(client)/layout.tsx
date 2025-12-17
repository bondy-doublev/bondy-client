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
      <div className="h-screen flex flex-col overflow-hidden">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto md:ml-[20%] bg-gray-50">
            {children}
            <GlobalVideoCall />
            <ChatBoxManager />
          </main>
        </div>
      </div>
    </div>
  );
}
