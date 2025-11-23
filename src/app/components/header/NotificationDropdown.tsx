"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { NotificationContext } from "@/app/providers/NotificationProvider";
import {
  handleNotificationMsg,
  notificationService,
} from "@/services/notificationService";
import { useTranslations } from "next-intl";
import { markAllNotificationsAsRead } from "@/lib/notificationSocket";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotificationDropdown() {
  const t = useTranslations("notification");
  const { notifications, setNotifications } = useContext(NotificationContext);
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const fetchMoreNotifications = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);
    const newData = await notificationService.getNotifications({
      page: reset ? 0 : page,
      size: 10,
    });
    setLoading(false);

    if (reset) {
      setNotifications(newData);
      setPage(1);
      setHasMore(newData.length === 10);
      return;
    }

    if (!newData.length) {
      setHasMore(false);
      return;
    }

    setNotifications((prev) => {
      const ids = new Set(prev.map((n) => n.id));
      const merged = [...prev, ...newData.filter((n) => !ids.has(n.id))];
      return merged;
    });
    setPage((prev) => prev + 1);
    setHasMore(newData.length === 10);
  };

  useEffect(() => {
    fetchMoreNotifications(true); // load trang đầu khi mount
  }, []);

  const handleDropdownOpen = async (open: boolean) => {
    setIsOpen(open);

    if (open) {
      try {
        await markAllNotificationsAsRead();
      } catch (err) {
        console.error("❌ markAllAsRead failed:", err);
      }
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  // 👉 Helper format thời gian: nếu hôm nay thì chỉ HH:mm, còn lại dd/MM/yyyy HH:mm
  const formatNotificationTime = (value: any) => {
    const createdAt = new Date(value);
    const now = new Date();

    const isToday = createdAt.toDateString() === now.toDateString();

    if (isToday) {
      return createdAt.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return createdAt.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      {/* 🔔 Icon chuông */}
      <DropdownMenuTrigger asChild>
        <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 transition">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      {/* 📋 Danh sách thông báo */}
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 rounded-xl border bg-white shadow-xl max-h-[460px] overflow-y-auto scroll-custom"
      >
        {/* Header */}
        <div className="p-4 font-semibold text-gray-800 border-b flex items-center justify-between sticky top-0 bg-white z-10">
          <span>{t("notification")}</span>
          <button
            onClick={() => {
              markAllNotificationsAsRead();
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
              );
            }}
            className="text-xs text-green-600 hover:underline"
          >
            {t("markAllRead")}
          </button>
        </div>

        {/* Body */}
        {notifications.length === 0 && !loading ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            {t("noNotification")}
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-3 cursor-pointer transition-colors duration-500 ease-in-out ${
                    !n.isRead
                      ? "bg-green-100 hover:bg-green-100"
                      : "bg-white hover:bg-green-100"
                  }`}
                  onClick={
                    n.redirectId !== null
                      ? () => router.push(`/post/${n.redirectId}/detail`)
                      : () => {}
                  }
                >
                  {n.actorAvatarUrl ? (
                    <UserAvatar
                      className="w-10 h-10"
                      userId={n.actorId}
                      avatarUrl={n.actorAvatarUrl}
                    />
                  ) : (
                    <DefaultAvatar
                      userId={n.actorId}
                      firstName={n.actorName}
                      className="w-10 h-10"
                    />
                  )}

                  <div className="flex flex-col">
                    <span
                      className={`text-sm leading-snug ${
                        n.isRead ? "text-gray-700" : "text-gray-900 font-medium"
                      }`}
                    >
                      {n.actorName} {handleNotificationMsg(n, t)}
                    </span>
                    <span className="text-[11px] text-gray-500 mt-1">
                      {formatNotificationTime(n.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 🔘 Nút Load More */}
            {hasMore && (
              <div className="p-3 text-center">
                <Button
                  variant="default"
                  disabled={loading}
                  onClick={() => fetchMoreNotifications()}
                  className="w-full text-sm text-black font-bold bg-gray-200 hover:bg-gray-300 rounded-md focus:ring-0 focus:outline-none"
                >
                  {loading ? t("loading") + "..." : t("loadMore")}
                </Button>
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
