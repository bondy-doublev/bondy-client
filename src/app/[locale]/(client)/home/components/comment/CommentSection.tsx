"use client";

import CommentComposer from "./CommentComposer";
import { getTimeAgo } from "@/utils/format";
import { commentService } from "@/services/commentService";
import { useRootComments } from "@/app/hooks/useRootComments";
import CommentItem from "@/app/[locale]/(client)/home/components/comment/CommentItem";

type Props = {
  t: (key: string) => string;
  postId: number;
  onCommentCountChange?: (postId: number, delta: number) => void;
  // 🆕 cho biết đang dùng trong modal hay page
  mode?: "modal" | "page";
};

export default function CommentSection({
  t,
  postId,
  onCommentCountChange,
  mode = "page", // default: dùng trong page
}: Props) {
  const {
    comments,
    loading,
    hasMore,
    loaderRef,
    addOptimistic,
    deleteOptimistic,
  } = useRootComments(postId);

  const handleCreateComment = async (
    content: string,
    mentionUserIds: number[]
  ) => {
    const created = await commentService.createComment({
      postId,
      content,
      mentionUserIds,
    });
    if (created) {
      addOptimistic(created);
      onCommentCountChange?.(postId, 1);
    }
  };

  const handleDeleteComment = async (commentId: number, childCount: number) => {
    await commentService.deleteComment({ commentId });
    deleteOptimistic(commentId);

    const comment = comments.find((c) => c.id === commentId);
    const deletedCount = comment?.parentId ? 1 : 1 + childCount;

    onCommentCountChange?.(postId, -deletedCount);
  };

  const renderFooter = () => {
    if (mode === "modal") {
      // 🧲 bám đáy trong scroll của modal (DialogContent wrap bên ngoài đã overflow-y-auto)
      return (
        <div className="sticky bottom-0 left-0 bg-white pt-3 -mx-4 border-t">
          <div className="px-4">
            <CommentComposer t={t} onSubmit={handleCreateComment} />
          </div>
        </div>
      );
    }

    // Mode "page": chỉ đơn giản là block dưới cùng, không fixed
    return (
      <div className="mt-4">
        <CommentComposer t={t} onSubmit={handleCreateComment} />
      </div>
    );
  };

  return (
    <div className="relative px-4 pb-4">
      <div className="space-y-3">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            t={t}
            comment={c}
            seconds={getTimeAgo(c.createdAt)}
            onDelete={handleDeleteComment}
            onCommentCountChange={onCommentCountChange}
          />
        ))}

        {hasMore && (
          <div ref={loaderRef} className="text-center py-6 text-gray-500">
            {loading ? t("loading") : t("scrollToLoadMore")}
          </div>
        )}
      </div>

      {renderFooter()}
    </div>
  );
}
