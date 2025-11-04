"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  connectNotificationService,
  subscribeToNotifications,
} from "@/lib/notificationSocket";
import { useAuthStore } from "@/store/authStore";

export type Notification = {
  id: number;
  userId: number;
  actorId: number;
  type: string;
  refType: string;
  refId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export const NotificationContext = createContext<{
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}>({
  notifications: [],
  setNotifications: () => {},
});

export default function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let sub: any;

    (async () => {
      try {
        await connectNotificationService();
        console.log("📡 Connected to notification service");

        sub = subscribeToNotifications((msg: Notification) => {
          console.log("📩 New notification:", msg);
          setNotifications((prev) => [msg, ...prev]);
        });
      } catch (err) {
        console.error("❌ WS connection failed:", err);
      }
    })();

    return () => {
      // ❌ Không disconnect ở đây để giữ kết nối xuyên suốt app
      sub?.unsubscribe?.();
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
