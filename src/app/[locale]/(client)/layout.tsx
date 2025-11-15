"use client";

import AppSidebar from "@/app/layout/default/Sidebar";
import AppNavbar from "@/app/layout/default/Navbar";
import IncomingCallModal from "./chat/components/IncomingCallModal";
import { useCall } from "@/context/CallContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { incomingCallId, setIncomingCallId } = useCall();
  return (
    <div>
      <div className="h-screen flex flex-col overflow-hidden">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto md:ml-[20%] p-4 bg-gray-50">
            {children}
            {incomingCallId && (
              <IncomingCallModal
                callId={incomingCallId}
                onClose={() => setIncomingCallId(null)}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
