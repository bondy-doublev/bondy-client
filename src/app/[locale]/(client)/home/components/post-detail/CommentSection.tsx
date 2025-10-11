"use client";

import CommentItem from "@/app/[locale]/(client)/home/components/post-detail/CommentItem";
import { Comment } from "@/models/Comment";
import { commentService } from "@/services/commentService";
import { getTimeAgo } from "@/utils/format";
import React, { useCallback, useEffect, useState } from "react";

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

  const fetchComments = useCallback(
    async (page: number) => {
      setLoading(true);
      const newComments = await commentService.getComments({
        postId,
        page,
        size: 5,
      });

      console.log(newComments);
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
    },
    [postId]
  );

  useEffect(() => {
    fetchComments(page);
  }, [page, fetchComments]);

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
        {hasMore && page > 0 ? (
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
        ) : page > 0 ? (
          <div className="text-center py-4 text-gray-400">
            {t("noMoreComment")}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">{t("noComment")}</div>
        )}
      </div>
    </div>
  );
}
