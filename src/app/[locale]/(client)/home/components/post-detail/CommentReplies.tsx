import CommentItem from "@/app/[locale]/(client)/home/components/post-detail/CommentItem";
import { SortDirection } from "@/constants/pagination";
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
        postId,
        parentId,
        page,
        size: 5,
        direction: SortDirection.ASC,
      });

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
        <div className="ml-4 mt-2 relative">
          <div className="absolute top-0 left-[-12px] w-[2px] h-full bg-gray-200 rounded-full" />

          <div className="space-y-2">
            {replies.map((r, index) => (
              <div key={r.id} className="relative">
                <div className="absolute left-[-12px] top-3 w-6 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg"></div>

                <CommentItem
                  t={t}
                  seconds={getTimeAgo(r.createdAt)}
                  comment={r}
                  isChild={true}
                />
              </div>
            ))}

            {/* Loader */}
            {hasMore && (
              <div className="ml-10">
                {loading ? (
                  <p className="text-xs text-gray-400">{t("loading")}</p>
                ) : (
                  <div
                    className="text-sm text-gray-400 font-semibold cursor-pointer hover:underline hover:text-gray-700 transition"
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    {t("loadmore")}...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
