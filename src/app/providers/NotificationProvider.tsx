"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  connectNotificationService,
  subscribeToNotifications,
} from "@/lib/notificationSocket";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import NotificationToast from "@/components/common/NotificationToast";
import { Notification } from "@/models/Notfication";
import { useTranslations } from "next-intl";
import { showBrowserNotification } from "@/lib/browserNotification";

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
  const t = useTranslations("notification");

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
          setNotifications((prev) => [
            msg,
            ...prev.filter((n) => n.id !== msg.id),
          ]);

          // ✅ Toast trong UI
          toast(
            <NotificationToast notification={msg} createdAt={msg.createdAt} />,
            {
              position: "bottom-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeButton: false,
              icon: false,
              style: {
                background: "transparent",
                boxShadow: "none",
                padding: 0,
                marginBottom: "20px",
              },
            }
          );

          // ✅ Native browser notification
          showBrowserNotification(msg, t);
        });
      } catch (err) {
        console.error("❌ WS connection failed:", err);
      }
    })();

    return () => {
      sub?.unsubscribe?.();
      // không deactivate client để giữ kết nối toàn app – anh đã comment đúng
    };
  }, [user, t]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
