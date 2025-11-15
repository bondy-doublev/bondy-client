"use client";

import CommentComposer from "./CommentComposer";
import { getTimeAgo } from "@/utils/format";
import { commentService } from "@/services/commentService";
import { useRootComments } from "@/app/hooks/useRootComments";
import CommentItem from "@/app/[locale]/(client)/home/components/comment/CommentItem";

export default function CommentSection({
  t,
  postId,
  onCommentCountChange,
}: {
  t: (key: string) => string;
  postId: number;
  onCommentCountChange?: (postId: number, delta: number) => void;
}) {
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

  return (
    <div className="relative px-4 pb-24 min-h-[350px]">
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

      {/* Composer gốc */}
      <div className="fixed bottom-0 left-0 p-4 w-full border-t bg-white z-100000">
        <CommentComposer t={t} onSubmit={handleCreateComment} />
      </div>
    </div>
  );
}
