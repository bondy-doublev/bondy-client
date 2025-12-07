// src/app/providers/AppClientProviders.tsx
"use client";

import React from "react";
import NotificationProvider from "@/app/providers/NotificationProvider";
import { ChatProvider } from "@/app/providers/ChatProvider";
import { useAuthStore } from "@/store/authStore";

export function AppClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  // Chưa login thì vẫn cho dùng Notification (nếu cần),
  // hoặc đơn giản return children
  if (!user) {
    return <NotificationProvider>{children}</NotificationProvider>;
  }

  return (
    <NotificationProvider>
      <ChatProvider
        xUser={{ id: user.id, role: user.role, email: user.email }}
        // ở Root layout chưa cần conversationId cụ thể
        // conversationId sẽ truyền sau ở layout/page chat nếu muốn
        debug={process.env.NODE_ENV === "development"}
      >
        {children}
      </ChatProvider>
    </NotificationProvider>
  );
}
