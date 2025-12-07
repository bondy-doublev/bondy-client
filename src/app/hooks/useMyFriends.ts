/* src/app/hooks/useMyFriends.ts */
import { useEffect, useState, useCallback } from "react";
import { Friendship } from "@/models/Friendship";
import { friendService } from "@/services/friendService";
import { SortDirection, SortField } from "@/constants/pagination";

const PAGE_SIZE = 10;

export function useMyFriends(userId: number) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // load thêm từ nút "Load more"
  const loadMore = useCallback(async () => {
    if (!userId || loading || !hasMore) return;

    setLoading(true);
    try {
      const newFriends = await friendService.getFriends(userId, {
        page,
        size: PAGE_SIZE,
        sortBy: SortField.CREATED_AT,
        direction: SortDirection.DESC,
      });

      setFriends((prev) => [...prev, ...newFriends]);

      if (newFriends.length < PAGE_SIZE) {
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
  }, [userId, page, loading, hasMore]);

  // initial load khi userId đổi – KHÔNG gọi loadMore ở đây
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const fetchFirstPage = async () => {
      setLoading(true);
      setFriends([]);
      setPage(0);
      setHasMore(true);

      try {
        const firstPage = await friendService.getFriends(userId, {
          page: 0,
          size: PAGE_SIZE,
          sortBy: SortField.CREATED_AT,
          direction: SortDirection.DESC,
        });

        if (cancelled) return;

        setFriends(firstPage);

        if (firstPage.length < PAGE_SIZE) {
          setHasMore(false);
        } else {
          setPage(1);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setHasMore(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchFirstPage();

    return () => {
      cancelled = true;
    };
  }, [userId]);

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
