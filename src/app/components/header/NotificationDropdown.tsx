"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { NotificationContext } from "@/app/providers/NotificationProvider";
import { notificationService } from "@/services/notificationService";
import { useTranslations } from "next-intl";

export default function NotificationDropdown() {
  const t = useTranslations("notification");

  const { notifications, setNotifications } = useContext(NotificationContext);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  // 🧮 Đếm số lượng chưa đọc
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // 🧩 Fetch thêm thông báo khi cuộn
  const fetchMoreNotifications = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const newData = await notificationService.getNotifications({
      page,
      size: 10,
    });
    setLoading(false);

    if (!newData.length) {
      setHasMore(false);
      return;
    }

    // merge tránh trùng (do WS có thể push thêm ở đầu)
    setNotifications((prev) => {
      const ids = new Set(prev.map((n) => n.id));
      const merged = [...prev, ...newData.filter((n) => !ids.has(n.id))];
      return merged;
    });
  };

  // 🧠 Infinite scroll trong dropdown
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  // ⏫ Khi page tăng → fetch thêm
  useEffect(() => {
    fetchMoreNotifications();
  }, [page]);

  // 🧭 Khi mở dropdown → mark read + reset pagination
  const handleDropdownOpen = async (open: boolean) => {
    setIsOpen(open);

    if (open) {
      // ✅ Cập nhật UI local ngay (cho mượt)
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
        }))
      );

      try {
        await notificationService.markAllAsRead();
      } catch (err) {
        console.error("❌ markAllAsRead failed:", err);
      }

      setPage(0);
      setHasMore(true);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleDropdownOpen}>
      {/* 🔔 Icon chuông */}
      <DropdownMenuTrigger asChild>
        <div className="relative w-8 h-8 flex items-center justify-center cursor-pointer rounded-full hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-white" />
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
        className="w-80 rounded-lg border bg-white shadow-lg max-h-[400px] overflow-y-auto scroll-custom"
      >
        <div className="p-3 font-semibold text-gray-700 border-b flex items-center justify-between">
          <span>{t("notification")}</span>
          {/* Nút “Đánh dấu tất cả là đã đọc” thủ công (tùy chọn) */}
          <button
            onClick={async () => {
              await notificationService.markAllAsRead();
              setNotifications((prev) =>
                prev.map((n) => ({ ...n, isRead: true }))
              );
            }}
            className="text-xs text-blue-600 hover:underline"
          >
            {t("markAllRead")}
          </button>
        </div>

        {notifications.length === 0 && !loading ? (
          <div className="p-3 text-sm text-gray-500 text-center">
            {t("noNotification")}
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start py-2 gap-1 hover:bg-gray-50 cursor-pointer"
              >
                <span
                  className={`text-sm ${
                    n.isRead ? "text-gray-600" : "text-gray-900 font-medium"
                  }`}
                >
                  {n.message}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(n.createdAt).toLocaleString("vi-VN")}
                </span>
              </DropdownMenuItem>
            ))}

            {/* 🌀 Loader cuối danh sách */}
            <div
              ref={loaderRef}
              className="py-2 text-center text-gray-400 text-xs"
            >
              {loading && t("loading")}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
