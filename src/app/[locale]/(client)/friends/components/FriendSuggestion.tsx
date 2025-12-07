"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";
import { FriendSuggest } from "@/models/Friendship";
import { useTranslations } from "next-intl";
import { SortDirection, SortField } from "@/constants/pagination";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

const PAGE_SIZE = 10;

export default function FriendSuggestion() {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = user?.id;

  const [suggestions, setSuggestions] = useState<FriendSuggest[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (!currentUserId || loading || !hasMore) return;

    setLoading(true);
    try {
      const newData = await friendService.suggestFriends(currentUserId, {
        page,
        size: PAGE_SIZE,
        sortBy: SortField.CREATED_AT,
        direction: SortDirection.DESC,
      });

      setSuggestions((prev) => [...prev, ...newData]);

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

  // initial load
  useEffect(() => {
    if (!currentUserId) return;

    let cancelled = false;

    const fetchFirstPage = async () => {
      setLoading(true);
      setSuggestions([]);
      setPage(0);
      setHasMore(true);

      try {
        const firstPage = await friendService.suggestFriends(currentUserId, {
          page: 0,
          size: PAGE_SIZE,
          sortBy: SortField.CREATED_AT,
          direction: SortDirection.DESC,
        });

        if (cancelled) return;

        setSuggestions(firstPage);

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

  // infinite scroll
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

  const handleSendRequest = async (receiverId: number) => {
    if (!currentUserId) return;

    try {
      const res = await friendService.sendFriendRequest(
        currentUserId,
        receiverId
      );

      if (res && res.success !== false) {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.userId === receiverId ? { ...s, isPending: true } : s
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert(t("sendRequestFailed"));
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
          {t("suggestionsTitle")}
        </h2>
      </div>

      {isInitialLoading ? (
        <div className="text-sm text-gray-600">{t("loading")}</div>
      ) : suggestions.length === 0 ? (
        <div className="text-sm text-gray-500">{t("noSuggestions")}</div>
      ) : (
        <>
          {/* card to hơn: 1 cột trên mobile, 2 cột từ md trở lên */}
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {suggestions.map((s) => (
              <li
                key={s.userId}
                className="
                    group cursor-pointer
                    flex flex-col sm:flex-row
                    items-start sm:items-center
                    justify-between
                    gap-4 hover:bg-gray-50
                    p-4 rounded-lg border border-gray-100 min-h-[96px]
                  "
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    {s.avatarUrl ? (
                      <UserAvatar
                        userId={s.userId}
                        avatarUrl={s.avatarUrl}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-md"
                      />
                    ) : (
                      <DefaultAvatar
                        userId={s.userId}
                        firstName={s.fullName}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-md"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-sm md:text-base font-medium text-gray-800 hover:underline hover:text-green-600 truncate"
                      title={s.fullName}
                    >
                      <UserName userId={s.userId} fullname={s.fullName ?? ""} />
                    </p>
                    <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                      {s.mutualFriends > 0 && (
                        <p>{t("mutualFriends", { count: s.mutualFriends })}</p>
                      )}
                      {s.nearBy && <p>{t("nearby")}</p>}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!s.isPending) handleSendRequest(s.userId);
                  }}
                  disabled={s.isPending}
                  className="px-3 py-2 rounded-md text-xs md:text-sm font-medium
                             bg-green-600 text-white hover:bg-green-700
                             disabled:bg-gray-300 disabled:text-gray-600 flex-shrink-0"
                >
                  {s.isPending ? t("pending") : t("addFriend")}
                </button>
              </li>
            ))}
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
