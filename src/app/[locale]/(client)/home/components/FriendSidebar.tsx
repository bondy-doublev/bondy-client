"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function FriendSidebar({
  className,
  userId,
  isDetail = false,
}: {
  className?: string;
  userId?: number;
  isDetail?: boolean;
}) {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = userId ?? user?.id ?? 0;

  // hook mới: thêm loading / hasMore / loadMore để dùng cho detail
  const { friendUsers, isInitialLoading, loading, hasMore, loadMore } =
    useMyFriends(currentUserId);

  const isNewFeed = !userId;

  // loader cho infinite scroll khi isDetail
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isDetail || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.2 }
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [isDetail, hasMore, loading, loadMore]);

  // tính danh sách friend sẽ render
  const getVisibleFriends = () => {
    if (isDetail) return friendUsers;

    // newfeed + không detail => top 15, scroll được
    if (isNewFeed) return friendUsers.slice(0, 15);

    // không newfeed + không detail => top 9, không scroll, không load thêm
    return friendUsers.slice(0, 9);
  };

  const visibleFriends = getVisibleFriends();

  const listContent = (
    <ul
      className={
        isDetail
          ? "grid grid-cols-2 gap-3"
          : isNewFeed
          ? "space-y-3"
          : "grid grid-cols-3 gap-3"
      }
    >
      {visibleFriends.map((friend) => (
        <li
          key={friend.id}
          className={`group cursor-pointer ${
            isDetail
              ? "flex items-center md:justify-between gap-0 md:gap-3 hover:bg-gray-50 p-2 rounded-lg border border-gray-100"
              : isNewFeed
              ? "flex items-center gap-3 hover:bg-gray-50 p-1 rounded-lg"
              : "flex flex-col items-start"
          }`}
        >
          <div
            className={`flex ${
              isDetail
                ? "flex-col md:flex-row md:items-center gap-3 flex-1"
                : !isNewFeed
                ? "flex-col"
                : "items-center gap-2"
            }`}
          >
            <div className="relative">
              {friend?.avatarUrl ? (
                <UserAvatar
                  userId={friend.id}
                  avatarUrl={friend.avatarUrl}
                  className={
                    isNewFeed ? "w-10 h-10" : "w-22.5 h-22.5 rounded-lg"
                  }
                />
              ) : (
                <DefaultAvatar
                  userId={friend.id}
                  firstName={friend?.fullName}
                  className={
                    isNewFeed ? "w-10 h-10" : "w-22.5 h-22.5 rounded-lg"
                  }
                />
              )}
              {isNewFeed && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <p
              className={`text-sm font-medium text-gray-700 hover:underline hover:text-green-600 ${
                isNewFeed
                  ? ""
                  : isDetail
                  ? "truncate"
                  : "mt-1 truncate max-w-[5rem]"
              }`}
              title={friend.fullName}
            >
              <UserName
                userId={friend.id}
                fullname={friend.fullName ?? ""}
                className="font"
              />
            </p>
          </div>

          {isDetail && (
            <button
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <MoreHorizontal size={18} className="text-gray-600" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`${
        isDetail ? "" : "hidden xl:block"
      } w-80 bg-white rounded-xl shadow p-4 pt-2 space-y-2 h-fit ${className}`}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700 py-2">
          {isNewFeed ? t("contacts") : t("friends")}
        </h2>

        {!isNewFeed && friendUsers.length > 0 && !isDetail && (
          <Link
            href={`/user/${userId}/friends`}
            className="text-green-600 hover:bg-green-100 p-2 rounded-md text-sm font-medium"
          >
            {t("seeAllFriends")}
          </Link>
        )}
      </div>

      {isInitialLoading ? (
        <p className="text-sm text-gray-500">{t("loading")}</p>
      ) : friendUsers.length > 0 ? (
        <>
          {/* 
            newfeed + không detail => bọc list trong div scroll 
            còn lại render bình thường
          */}
          {isNewFeed && !isDetail ? (
            <div className="max-h-96 overflow-y-auto pr-1 scroll-custom">
              {listContent}
            </div>
          ) : (
            listContent
          )}

          {/* Infinite scroll chỉ cho detail */}
          {isDetail && hasMore && (
            <div
              ref={loaderRef}
              className="mt-2 h-8 flex items-center justify-center text-xs text-gray-500"
            >
              {loading && t("loading")}
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-500">{t("noFriends")}</p>
      )}
    </aside>
  );
}
