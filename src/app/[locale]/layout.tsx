"use client";

import { CallProvider } from "@/context/CallContext";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const currentUserId = user?.id ?? null;

  return (
    <html lang="en">
      <body>
        <CallProvider currentUserId={currentUserId}>{children}</CallProvider>
      </body>
    </html>
  );
}
