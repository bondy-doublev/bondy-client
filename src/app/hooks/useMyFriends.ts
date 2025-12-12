/* src/app/hooks/useMyFriends.ts */
import { useEffect, useState, useCallback } from "react";
import { Friendship } from "@/models/Friendship";
import { friendService } from "@/services/friendService";
import { SortDirection, SortField } from "@/constants/pagination";

const PAGE_SIZE = 10;

type UseMyFriendsOptions = {
  getAll?: boolean; // ✅ lấy toàn bộ
  enabled?: boolean; // ✅ có fetch hay không
};

export function useMyFriends(userId: number, options?: UseMyFriendsOptions) {
  const getAll = !!options?.getAll;
  const enabled = options?.enabled ?? true;

  const [friends, setFriends] = useState<Friendship[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMore = useCallback(async () => {
    if (!enabled) return;
    if (!userId || loading || !hasMore) return;
    if (getAll) return; // ✅ getAll thì không loadMore

    setLoading(true);
    try {
      const newFriends = await friendService.getFriends(
        userId,
        {
          page,
          size: PAGE_SIZE,
          sortBy: SortField.CREATED_AT,
          direction: SortDirection.DESC,
        },
        { getAll: false }
      );

      setFriends((prev) => [...prev, ...newFriends]);

      if (newFriends.length < PAGE_SIZE) setHasMore(false);
      else setPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [enabled, userId, page, loading, hasMore, getAll]);

  useEffect(() => {
    if (!enabled) return;
    if (!userId) return;

    let cancelled = false;

    const fetchFriends = async () => {
      setLoading(true);
      setFriends([]);
      setPage(0);
      setHasMore(true);

      try {
        if (getAll) {
          const all = await friendService.getFriends(userId, undefined, {
            getAll: true,
          });
          if (cancelled) return;

          setFriends(all);
          setHasMore(false);
          setPage(0);
          return;
        }

        const firstPage = await friendService.getFriends(
          userId,
          {
            page: 0,
            size: PAGE_SIZE,
            sortBy: SortField.CREATED_AT,
            direction: SortDirection.DESC,
          },
          { getAll: false }
        );

        if (cancelled) return;

        setFriends(firstPage);

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

    fetchFriends();

    return () => {
      cancelled = true;
    };
  }, [userId, enabled, getAll]);

  const friendUsers = friends.map((f) =>
    f.senderId === userId ? f.receiverInfo : f.senderInfo
  );

  const isInitialLoading = loading && page === 0;

  return {
    loading,
    isInitialLoading,
    hasMore,
    friendUsers,
    loadMore,
  };
}
