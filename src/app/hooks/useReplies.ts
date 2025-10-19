import { useCallback, useEffect, useState } from "react";
import { commentService } from "@/services/commentService";
import { SortDirection } from "@/constants/pagination";
import { mergeUniqueById } from "@/utils/list";
import { Comment } from "@/models/Comment";

export function useReplies(postId: number, parentId: number, pageSize = 5) {
  const [replies, setReplies] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ✅ fetch ổn định, không phụ thuộc loading/hasMore
  const fetchPage = useCallback(
    async (pageToFetch: number) => {
      setLoading(true);
      try {
        const newComments = await commentService.getComments({
          postId,
          parentId,
          page: pageToFetch,
          size: pageSize,
          direction: SortDirection.ASC,
        });

        if (!newComments || newComments.length === 0) {
          setHasMore(false);
          return;
        }

        // Nếu ít hơn pageSize => xem như hết
        if (newComments.length < pageSize) {
          setHasMore(false);
        }

        setReplies((prev) => mergeUniqueById(prev, newComments) as Comment[]);
      } catch (error) {
        console.error("Failed to fetch replies", error);
      } finally {
        setLoading(false);
      }
    },
    [postId, parentId, pageSize]
  );

  useEffect(() => {
    fetchPage(page);
  }, [page, fetchPage]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setPage((p) => p + 1);
  }, [loading, hasMore]);

  const addOptimistic = useCallback(
    (r: Comment) => setReplies((prev) => [...prev, r]),
    []
  );

  return { replies, loading, hasMore, loadMore, addOptimistic };
}
