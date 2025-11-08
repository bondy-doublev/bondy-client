"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { Notification, NotificationType, RefType } from "@/models/Notfication";
import { handleNotificationMsg } from "@/services/notificationService";
import { useTranslations } from "next-intl";
import React from "react";

export default function NotificationToast({
  notification,
  createdAt,
}: {
  notification: Notification;
  createdAt?: string;
}) {
  const t = useTranslations("notification");

  const timeText = createdAt
    ? new Date(createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : t("recently");

  return (
    <div className="flex items-start gap-3 bg-white text-gray-800 p-3 rounded-xl shadow-md min-w-[280px] max-w-[360px] border border-gray-200 hover:shadow-lg transition">
      {notification.actorAvatarUrl ? (
        <UserAvatar
          className="w-10 h-10"
          userId={notification.actorId}
          avatarUrl={notification.actorAvatarUrl}
        />
      ) : (
        <DefaultAvatar
          userId={notification.actorId}
          firstName={notification.actorName}
          className="w-10 h-10"
        />
      )}

      <div className="flex flex-col">
        <span className="text-sm font-medium leading-snug">
          {notification.actorName} {handleNotificationMsg(notification, t)}
        </span>
        <span className="text-[11px] text-gray-500 mt-1">{timeText}</span>
      </div>
    </div>
  );
}
