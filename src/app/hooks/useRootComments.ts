import { useCallback, useEffect, useRef, useState } from "react";
import { commentService } from "@/services/commentService";
import { mergeUniqueById } from "@/utils/list";
import { Comment } from "@/models/Comment";

export function useRootComments(postId: number, pageSize = 5) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ✅ chỉ phụ thuộc postId, pageSize
  const fetchPage = useCallback(
    async (pageToFetch: number) => {
      setLoading(true);
      const newComments = await commentService.getComments({
        postId,
        page: pageToFetch,
        size: pageSize,
      });
      setLoading(false);

      if (!newComments || newComments.length === 0) {
        setHasMore(false);
        return;
      }

      setComments((prev) => mergeUniqueById(prev, newComments) as Comment[]);
    },
    [postId, pageSize]
  );

  // ✅ Gọi lại khi page hoặc postId đổi
  useEffect(() => {
    fetchPage(page);
  }, [page, postId, fetchPage]);

  // ✅ Infinite scroll observer (chạy 1 lần)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.2 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const addOptimistic = (comment: Comment) =>
    setComments((prev) => [comment, ...prev]);

  const incChildCount = (parentId: number) =>
    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, childCount: (c.childCount ?? 0) + 1 } : c
      )
    );

  const deleteOptimistic = (id: number) =>
    setComments((prev) => prev.filter((c) => c.id !== id));

  return {
    comments,
    loading,
    hasMore,
    loaderRef,
    addOptimistic,
    incChildCount,
    deleteOptimistic,
  };
}
