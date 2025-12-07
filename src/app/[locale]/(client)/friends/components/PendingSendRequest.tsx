"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import { SortDirection, SortField } from "@/constants/pagination";
import { Friendship } from "@/models/Friendship";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

const PAGE_SIZE = 10;

export default function PendingSentRequests() {
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
      const newData = await friendService.getPendingSentRequests(
        currentUserId,
        {
          page,
          size: PAGE_SIZE,
          sortBy: SortField.CREATED_AT,
          direction: SortDirection.DESC,
        }
      );

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

  useEffect(() => {
    if (!currentUserId) return;

    let cancelled = false;

    const fetchFirstPage = async () => {
      setLoading(true);
      setRequests([]);
      setPage(0);
      setHasMore(true);

      try {
        const firstPage = await friendService.getPendingSentRequests(
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

  if (!currentUserId) {
    return <div className="text-sm text-gray-500">{t("loadingUser")}</div>;
  }

  const isInitialLoading = loading && page === 0;

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-4 pt-2 space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700 py-2">
          {t("pendingSentTitle")}
        </h2>
      </div>

      {isInitialLoading ? (
        <div className="text-sm text-gray-600">{t("loading")}</div>
      ) : requests.length === 0 ? (
        <div className="text-sm text-gray-500">{t("noPendingSent")}</div>
      ) : (
        <>
          {/* card to hơn: 1 cột trên mobile, 2 cột từ md trở lên */}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((r) => {
              const receiver = r.receiverInfo;
              if (!receiver) return null;

              return (
                <li
                  key={r.id}
                  className="group cursor-pointer flex items-center gap-4 hover:bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[96px]"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      {receiver.avatarUrl ? (
                        <UserAvatar
                          userId={receiver.id}
                          avatarUrl={receiver.avatarUrl}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-md"
                        />
                      ) : (
                        <DefaultAvatar
                          userId={receiver.id}
                          firstName={receiver.fullName}
                          className="w-16 h-16 md:w-20 md:h-20 rounded-md"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="text-sm md:text-base font-medium text-gray-800 hover:underline hover:text-green-600 truncate"
                        title={receiver.fullName}
                      >
                        <UserName
                          userId={receiver.id}
                          fullname={receiver.fullName ?? ""}
                        />
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {t("waitingResponse")}
                      </p>
                    </div>
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
