import { useEffect, useState } from "react";
import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";
import { commentService } from "@/services/commentService";
import CommentItem from "@/app/[locale]/(client)/home/components/comment/CommentItem";
import { Comment } from "@/models/Comment";

export default function CommentReplies({
  replies,
  loading,
  hasMore,
  loadMore,
  addOptimistic,
  deleteOptimistic,
  onAnyReplyCreated,
  onAnyReplyDeleted,
}: {
  replies: Comment[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  addOptimistic: (comment: Comment) => void;
  deleteOptimistic: (commentId: number) => void;
  onAnyReplyCreated?: () => void;
  onAnyReplyDeleted?: () => void;
}) {
  const t = useTranslations("post");
  const [visible, setVisible] = useState(false);

  // Mỗi lần số lượng replies thay đổi -> trigger animation lại
  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [replies.length]);

  return (
    <div className="ml-4 mt-2 relative">
      {/* Cột dọc nối replies */}
      <div className="absolute top-0 left-[-12px] w-[2px] h-full bg-gray-200 rounded-full" />

      <div className="space-y-2">
        {replies.map((r, index) => (
          <div
            key={r.id}
            className={`relative transform transition-all duration-200 ease-out
              ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-1"
              }`}
            style={{
              transitionDelay: `${index * 40}ms`, // stagger nhẹ theo index
            }}
          >
            <div className="absolute left-[-12px] top-3 w-6 h-4 border-l-2 border-b-2 border-gray-200 rounded-bl-lg" />
            <CommentItem
              t={t}
              seconds={getTimeAgo(r.createdAt)}
              comment={r}
              isChild
              onDelete={async () => {
                await commentService.deleteComment({ commentId: r.id });
                deleteOptimistic(r.id);
                onAnyReplyDeleted?.();
              }}
              onCreate={(comment: Comment) => {
                addOptimistic(comment);
                onAnyReplyCreated?.();
              }}
            />
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
