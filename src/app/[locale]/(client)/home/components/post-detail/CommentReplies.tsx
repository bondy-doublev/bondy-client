// CommentReplies.tsx
import CommentComposer from "./CommentComposer";
import { getTimeAgo } from "@/utils/format";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { commentService } from "@/services/commentService";
import CommentItem from "@/app/[locale]/(client)/home/components/post-detail/CommentItem";
import { useReplies } from "@/app/hooks/useReplies";

export default function CommentReplies({
  postId,
  parentId,
}: {
  postId: number;
  parentId: number;
}) {
  const t = useTranslations("post");
  const { replies, loading, hasMore, loadMore, addOptimistic } = useReplies(
    postId,
    parentId
  );
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  return (
    <div className="ml-4 mt-2 relative">
      <div className="absolute top-0 left-[-12px] w-[2px] h-full bg-gray-200 rounded-full" />
      <div className="space-y-2">
        {replies.map((r) => (
          <div key={r.id} className="relative">
            <div className="absolute left-[-12px] top-3 w-6 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg" />
            <CommentItem
              t={t}
              seconds={getTimeAgo(r.createdAt)}
              comment={r}
              isChild
              onReplyClick={() =>
                setActiveReplyId((prev) => (prev === r.id ? null : r.id))
              }
            />
            {activeReplyId === r.id && (
              <div className="ml-10 mt-2">
                <CommentComposer
                  t={t}
                  onSubmit={async (content) => {
                    const newReply = await commentService.createComment({
                      postId,
                      parentId: r.id,
                      content,
                    });
                    if (newReply) {
                      addOptimistic(newReply);
                      setActiveReplyId(null);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="ml-10">
            {loading ? (
              <p className="text-xs text-gray-400">{t("loading")}</p>
            ) : (
              <button
                className="text-sm text-gray-400 font-semibold hover:underline hover:text-gray-700 transition"
                onClick={loadMore}
              >
                {t("loadmore")}…
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
