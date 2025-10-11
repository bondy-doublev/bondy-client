"use client";

import CommentItem from "@/app/[locale]/(client)/home/components/post-detail/CommentItem";
import { Comment } from "@/models/Comment";
import { commentService } from "@/services/commentService";
import { getTimeAgo } from "@/utils/format";
import React, { useEffect, useRef, useState } from "react";

export default function CommentSection({
  t,
  postId,
}: {
  t: (key: string) => string;
  postId: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const newComments = await commentService.getComments({
        postId,
        page,
        size: 5,
      });
      setLoading(false);

      if (!newComments || newComments.length === 0) {
        setHasMore(false);
        return;
      }

      setComments((prev) => {
        const merged = [...prev, ...newComments];
        const unique = Array.from(
          new Map(merged.map((p) => [p.id, p])).values()
        );
        return unique;
      });
    };

    fetchComments();
  }, [page, postId]);

  return (
    <div className="px-4 pb-4">
      {/* input */}
      {/* comments list */}
      <div className="space-y-3">
        {comments.map((c) => (
          <CommentItem
            t={t}
            key={c.id}
            comment={c}
            childCount={c.childCount}
            seconds={getTimeAgo(c.createdAt)}
          />
        ))}

        {/* Loader */}
        {hasMore ? (
          <div ref={loaderRef} className="text-center py-6 text-gray-500">
            {loading ? t("loading") : t("scrollToLoadMore")}
          </div>
        ) : !hasMore && page > 0 ? (
          <div className="text-center py-4 text-gray-400">
            {t("noMoreComment")}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">{t("noComment")}</div>
        )}
        {/* Loader */}
        {/* {hasMore ? (
          <div className="text-center py-4 text-gray-500">
            {loading ? (
              t("loading")
            ) : (
              <div
                className="text-sm text-gray-400 font-semibold cursor-pointer hover:underline hover:text-gray-700 transition"
                onClick={() => {
                  setPage((prev) => prev + 1);
                }}
              >
                {t("loadmore")}
              </div>
            )}
          </div>
        ) : !hasMore && page > 0 ? (
          <div className="text-center py-4 text-gray-400">
            {t("noMoreComment")}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">{t("noComment")}</div>
        )} */}
      </div>
    </div>
  );
}
