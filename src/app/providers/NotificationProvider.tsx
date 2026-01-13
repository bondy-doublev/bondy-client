"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  connectNotificationService,
  disconnectNotificationService,
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
      disconnectNotificationService();
      setNotifications([]);
      return;
    }

    const accessToken = localStorage.getItem("accessToken");

    (async () => {
      try {
        await connectNotificationService(accessToken!);

        // Subscribe lại (quan trọng: vì reconnect có thể xảy ra bất kỳ lúc nào)
        const sub = subscribeToNotifications((msg: Notification) => {
          setNotifications((prev) => [
            msg,
            ...prev.filter((n) => n.id !== msg.id),
          ]);

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

          showBrowserNotification(msg, t);
        });

        // Lưu sub để unsubscribe khi cleanup
        return () => {
          sub?.unsubscribe();
        };
      } catch (err) {
        console.error("❌ WS connection failed:", err);
      }
    })();
  }, [user, t]); // thêm dependency nếu token nằm riêng

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
