"use client";

import { useEffect, useState } from "react";
import CommentComposer from "./CommentComposer";
import { getTimeAgo } from "@/utils/format";
import { commentService } from "@/services/commentService";
import { useRootComments } from "@/app/hooks/useRootComments";
import CommentItem from "@/app/[locale]/(client)/home/components/comment/CommentItem";

type Props = {
  t: (key: string) => string;
  postId: number;
  onCommentCountChange?: (postId: number, delta: number) => void;
};

export default function CommentSection({
  t,
  postId,
  onCommentCountChange,
}: Props) {
  const {
    comments,
    loading,
    hasMore,
    loaderRef,
    addOptimistic,
    deleteOptimistic,
  } = useRootComments(postId);

  const [showComments, setShowComments] = useState(false);
  const [commentsVisible, setCommentsVisible] = useState(false);

  // Reset hiệu ứng khi đổi post
  useEffect(() => {
    setShowComments(false);
    setCommentsVisible(false);
  }, [postId]);

  // Dùng đúng thời gian loading:
  // - loading = true  -> ẩn list, chỉ show "loading"
  // - loading = false -> show list + animate ngay
  useEffect(() => {
    if (loading) {
      setShowComments(false);
      setCommentsVisible(false);
      return;
    }

    setShowComments(true);
    const id = requestAnimationFrame(() => setCommentsVisible(true));
    return () => cancelAnimationFrame(id);
  }, [loading, postId]);

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
    <div className="relative px-4 pb-4">
      {/* List comment + load more: có hiệu ứng */}
      {showComments ? (
        <div
          className={`space-y-3 py-2 transition-all duration-300 ease-out transform
            ${
              commentsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
        >
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
              {loading && t("loading")}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">{t("loading")}</div>
      )}

      {/* Composer sticky: hiện ngay, không delay */}
      <div className="sticky bottom-0 left-0 bg-white pt-3 -mx-4 border-t">
        <div className="px-4">
          <CommentComposer t={t} onSubmit={handleCreateComment} />
        </div>
      </div>
    </div>
  );
}
