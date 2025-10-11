import CommentItem from "@/app/[locale]/(client)/home/components/post-detail/CommentItem";
import { SortDirection, SortField } from "@/constants/pagination";
import { Comment } from "@/models/Comment";
import { commentService } from "@/services/commentService";
import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";

export default function CommentReplies({
  postId,
  parentId,
}: {
  postId: number;
  parentId: number;
}) {
  const t = useTranslations("post");
  const [replies, setReplies] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchComments = useCallback(
    async (page: number) => {
      setLoading(true);
      const newComments = await commentService.getComments({
        postId: postId,
        parentId: parentId,
        page,
        size: 5,
        direction: SortDirection.ASC,
      });

      console.log(newComments);
      setLoading(false);

      if (!newComments || newComments.length === 0) {
        setHasMore(false);
        return;
      }

      setReplies((prev) => {
        const merged = [...prev, ...newComments];
        const unique = Array.from(
          new Map(merged.map((p) => [p.id, p])).values()
        );
        return unique;
      });
    },
    [postId, parentId]
  );

  useEffect(() => {
    fetchComments(page);
  }, [page, fetchComments]);

  return (
    <div>
      {replies && replies.length > 0 && (
        <div className="ml-2 mt-2 space-y-2">
          {replies.map((r) => (
            <CommentItem
              t={t}
              key={r.id}
              seconds={getTimeAgo(r.createdAt)}
              comment={r}
              isChild={true}
            />
          ))}

          {/* Loader */}
          {hasMore && (
            <div>
              {loading ? (
                t("loading")
              ) : (
                <div
                  className="ml-12 text-sm text-gray-400 font-semibold cursor-pointer hover:underline hover:text-gray-700 transition"
                  onClick={() => {
                    setPage((prev) => prev + 1);
                  }}
                >
                  {t("loadmore")}...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
