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
  mode?: "modal" | "page";
};

export default function CommentSection({
  t,
  postId,
  onCommentCountChange,
  mode = "page",
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

  // 🔹 Mode MODAL: bám đáy trong scroll của modal
  if (mode === "modal") {
    return (
      <div className="relative px-4 pb-4">
        <div className="space-y-3 py-2">
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

        {/* Composer sticky dưới cùng trong modal */}
        <div className="sticky bottom-0 left-0 bg-white pt-3 -mx-4 border-t">
          <div className="px-4">
            <CommentComposer t={t} onSubmit={handleCreateComment} />
          </div>
        </div>
      </div>
    );
  }

  // 🔹 Mode PAGE: max-height + scroll comment + composer dính đáy block
  return (
    <div className="relative max-h-[70vh] flex flex-col bg-white border-t pt-2">
      {/* Danh sách comment – phần này scroll */}
      <div className="flex-1 overflow-y-auto px-4 pt-1 pb-3 space-y-3 scroll-custom">
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
          <div ref={loaderRef} className="text-center py-4 text-gray-500">
            {loading ? t("loading") : t("scrollToLoadMore")}
          </div>
        )}
      </div>

      {/* Composer luôn ở đáy CommentSection */}
      <div className="border-t px-4 pt-3 pb-3 bg-white">
        <CommentComposer t={t} onSubmit={handleCreateComment} />
      </div>
    </div>
  );
}
