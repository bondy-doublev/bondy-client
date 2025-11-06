"use client";

import React, { createContext, useEffect, useState } from "react";
import {
  connectNotificationService,
  subscribeToNotifications,
} from "@/lib/notificationSocket";
import { useAuthStore } from "@/store/authStore";
import { toast } from "react-toastify";
import NotificationToast from "@/components/common/NotificationToast";
import { Notification, NotificationType, RefType } from "@/models/Notfication";
import { useTranslations } from "next-intl";

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

  const [notificationMsg, setNotificationMsg] = useState("");

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

          // ✅ Hiển thị toast kiểu Facebook
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

  const handleNotificationMsg = (n: Notification) => {
    const map: Record<string, string> = {
      [`${NotificationType.LIKE}_${RefType.POST}`]: "likedYourPost",
      [`${NotificationType.COMMENT}_${RefType.POST}`]: "commentedYourPost",
      [`${NotificationType.REPLY_COMMENT}_${RefType.COMMENT}`]:
        "repliedYourComment",
    };

    const key = `${n.type}_${n.refType}`;
    return t(map[key] || "newNotification");
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}
