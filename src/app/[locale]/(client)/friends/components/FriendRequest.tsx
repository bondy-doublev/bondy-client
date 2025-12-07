"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";
import { Friendship } from "@/models/Friendship";
import { useTranslations } from "next-intl";
import { SortDirection, SortField } from "@/constants/pagination";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

const PAGE_SIZE = 10;

export default function FriendRequests() {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [requests, setRequests] = useState<Friendship[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!currentUserId || loading || !hasMore) return;

    setLoading(true);
    try {
      const newData = await friendService.getPendingRequests(currentUserId, {
        page,
        size: PAGE_SIZE,
        sortBy: SortField.CREATED_AT,
        direction: SortDirection.DESC,
      });

      setRequests((prev) => [...prev, ...newData]);

      if (newData.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, page, loading, hasMore]);

  // Initial load
  useEffect(() => {
    if (!currentUserId) return;

    let cancelled = false;

    const fetchFirstPage = async () => {
      setLoading(true);
      setRequests([]);
      setPage(0);
      setHasMore(true);

      try {
        const firstPage = await friendService.getPendingRequests(
          currentUserId,
          {
            page: 0,
            size: PAGE_SIZE,
            sortBy: SortField.CREATED_AT,
            direction: SortDirection.DESC,
          }
        );

        if (cancelled) return;

        setRequests(firstPage);

        if (firstPage.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setPage(1);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFirstPage();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  // Infinite scroll
  useEffect(() => {
    if (!hasMore) return;

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
  }, [hasMore, loading, loadMore]);

  const handleAccept = async (friendship: Friendship) => {
    try {
      await friendService.acceptFriendRequest(
        friendship.receiverId,
        friendship.senderId
      );
      setRequests((prev) => prev.filter((r) => r.id !== friendship.id));
    } catch (err) {
      console.error(err);
      alert(t("acceptFailed"));
    }
  };

  const handleReject = async (friendship: Friendship) => {
    try {
      await friendService.unFriend(friendship.senderId);
      setRequests((prev) => prev.filter((r) => r.id !== friendship.id));
    } catch (err) {
      console.error(err);
      alert(t("rejectFailed"));
    }
  };

  if (!currentUserId) {
    return <div className="text-sm text-gray-500">{t("loadingUser")}</div>;
  }

  const isInitialLoading = loading && page === 0;

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-4 pt-2 space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700 py-2">
          {t("friendRequestsTitle")}
        </h2>
      </div>

      {isInitialLoading ? (
        <div className="text-sm text-gray-600">{t("loading")}</div>
      ) : requests.length === 0 ? (
        <div className="text-sm text-gray-500">{t("noFriendRequests")}</div>
      ) : (
        <>
          {/* card to hơn: 1 cột trên mobile, 2 cột từ md trở lên */}
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {requests.map((f) => {
              const sender = f.senderInfo;
              if (!sender) return null;

              return (
                <li
                  key={f.id}
                  className="
                    group cursor-pointer
                    flex flex-col sm:flex-row
                    items-start sm:items-center
                    justify-between
                    gap-4 hover:bg-gray-50
                    p-4 rounded-lg border border-gray-100 min-h-[96px]
                  "
                >
                  {/* Avatar + name */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      {sender.avatarUrl ? (
                        <UserAvatar
                          userId={sender.id}
                          avatarUrl={sender.avatarUrl}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg"
                        />
                      ) : (
                        <DefaultAvatar
                          userId={sender.id}
                          firstName={sender.fullName}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-lg"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-sm md:text-base font-medium text-gray-800 hover:underline hover:text-green-600 truncate"
                        title={sender.fullName}
                      >
                        <UserName
                          userId={sender.id}
                          fullname={sender.fullName ?? ""}
                        />
                      </p>
                    </div>
                  </div>

                  {/* Nút:
                      - mobile (<md): inline với avatar+name (vì flex-row)
                      - md-only: xuống hàng dưới (vì md:flex-col)
                      - lg+: lại lên ngang avatar+name (lg:flex-row)
                  */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(f);
                      }}
                      className="px-3 py-2 rounded-md text-xs md:text-sm font-medium
                 bg-green-600 text-white hover:bg-green-700"
                    >
                      {t("confirm")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(f);
                      }}
                      className="px-3 py-2 rounded-md text-xs md:text-sm font-medium
                 border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {hasMore && (
            <div
              ref={loaderRef}
              className="mt-3 h-8 flex items-center justify-center text-xs text-gray-500"
            >
              {loading && t("loading")}
            </div>
          )}
        </>
      )}
    </section>
  );
}
