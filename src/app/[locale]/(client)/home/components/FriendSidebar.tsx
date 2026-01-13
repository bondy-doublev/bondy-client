"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, User as UserIcon, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";

import ConfirmDialog from "@/app/components/dialog/ConfirmDialog";
import { friendService } from "@/services/friendService";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();

  const { user } = useAuthStore();
  const currentUserId = userId ?? user?.id ?? 0;

  const { friendUsers, isInitialLoading, loading, hasMore, loadMore } =
    useMyFriends(currentUserId);

  const isNewFeed = !userId;

  const isOwner = user?.id === userId;

  // ✅ Không setState theo friendUsers nữa -> tránh loop
  const [removedIds, setRemovedIds] = useState<Set<number>>(() => new Set());

  const filteredFriends = useMemo(() => {
    return friendUsers.filter((f) => !removedIds.has(f.id));
  }, [friendUsers, removedIds]);

  // loader cho infinite scroll khi isDetail
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ✅ tránh loadMore đổi reference gây effect chạy lại liên tục
  const loadMoreRef = useRef(loadMore);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (!isDetail || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          loadMoreRef.current();
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
  }, [isDetail, hasMore, loading]);

  const visibleFriends = useMemo(() => {
    if (isDetail) return filteredFriends;
    if (isNewFeed) return filteredFriends.slice(0, 15);
    return filteredFriends.slice(0, 9);
  }, [filteredFriends, isDetail, isNewFeed]);

  const handleUnfriend = async (friendId: number) => {
    await friendService.unFriend(friendId);
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.add(friendId);
      return next;
    });
  };

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
          // ✅ click item -> push profile (không dùng <Link> bọc cả item)
          onClick={() => router.push(`/user/${friend.id}`)}
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
                    isNewFeed
                      ? "w-10 h-10"
                      : !isDetail
                      ? "w-22.5 h-22.5 rounded-lg"
                      : "w-18 h-18 rounded-lg"
                  }
                />
              ) : (
                <DefaultAvatar
                  userId={friend.id}
                  firstName={friend?.fullName}
                  className={
                    isNewFeed
                      ? "w-10 h-10"
                      : !isDetail
                      ? "w-22.5 h-22.5 rounded-lg"
                      : "w-18 h-18 rounded-lg"
                  }
                />
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
              <UserName userId={friend.id} fullname={friend.fullName ?? ""} />
            </p>
          </div>

          {/* 3 dots - chỉ detail */}
          {isDetail && (
            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Friend actions"
                  >
                    <MoreHorizontal size={18} className="text-gray-600" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {/* View profile: dùng router.push để khỏi <a> lồng <a> */}
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      router.push(`/user/${friend.id}`);
                    }}
                  >
                    <UserIcon className="w-4 h-4 mr-2" />
                    {t("viewProfile")}
                  </DropdownMenuItem>

                  {isOwner && (
                    <ConfirmDialog
                      key={`confirm-unfriend-${friend.id}`}
                      title={t("confirmUnfriendTitle")}
                      description={t("confirmUnfriendDesc")}
                      confirmText={t("unfriend")}
                      cancelText={t("cancel")}
                      loadingText={t("unfriending")}
                      variant="destructive"
                      onConfirm={() => handleUnfriend(friend.id)}
                      trigger={
                        <DropdownMenuItem
                          className="text-gray-600 cursor-pointer"
                          onSelect={(e) => {
                            e.preventDefault(); // ✅ giữ dropdown để dialog mở ổn
                          }}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          {t("unfriend")}
                        </DropdownMenuItem>
                      }
                    />
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

        {!isNewFeed && filteredFriends.length > 0 && !isDetail && (
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
      ) : filteredFriends.length > 0 ? (
        <>
          {isNewFeed && !isDetail ? (
            <div className="max-h-96 overflow-y-auto pr-1 scroll-custom">
              {listContent}
            </div>
          ) : (
            listContent
          )}

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
