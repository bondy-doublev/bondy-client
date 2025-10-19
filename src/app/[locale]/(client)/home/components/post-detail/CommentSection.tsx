// CommentSection.tsx
"use client";

import CommentComposer from "./CommentComposer";
import CommentReplies from "./CommentReplies";
import { getTimeAgo } from "@/utils/format";
import { useState } from "react";
import { commentService } from "@/services/commentService";
import { useRootComments } from "@/app/hooks/useRootComments";
import CommentItem from "@/app/[locale]/(client)/home/components/post-detail/CommentItem";

export default function CommentSection({
  t,
  postId,
}: {
  t: (key: string) => string;
  postId: number;
}) {
  const {
    comments,
    loading,
    hasMore,
    loaderRef,
    addOptimistic,
    incChildCount,
  } = useRootComments(postId);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);

  const handleCreateComment = async (content: string) => {
    const created = await commentService.createComment({ postId, content });
    if (created) {
      addOptimistic(created);
    }
  };

  return (
    <div className="relative px-4 pb-24">
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id}>
            <CommentItem
              t={t}
              comment={c}
              childCount={c.childCount}
              seconds={getTimeAgo(c.createdAt)}
              onReplyClick={() =>
                setActiveReplyId((prev) => (prev === c.id ? null : c.id))
              }
            />

            {/* composer inline dưới comment đang mở */}
            {activeReplyId === c.id && (
              <div className="ml-10 mt-2">
                <CommentComposer
                  t={t}
                  onSubmit={async (content) => {
                    const newReply = await commentService.createComment({
                      postId,
                      parentId: c.id,
                      content,
                    });
                    if (newReply) {
                      // không cần fetch lại replies; phần CommentReplies sẽ load khi mở
                      incChildCount(c.id); // tăng childCount cho root comment
                      setActiveReplyId(null);
                    }
                  }}
                />
              </div>
            )}

            {/* phần replies (chỉ render khi user mở xem) */}
            {c.childCount! > 0 && activeReplyId === c.id && (
              <CommentReplies postId={postId} parentId={c.id} />
            )}
          </div>
        ))}

        {/* Loader dưới cùng list */}
        {hasMore && (
          <div ref={loaderRef} className="text-center py-6 text-gray-500">
            {loading ? t("loading") : t("scrollToLoadMore")}
          </div>
        )}
      </div>

      {/* Composer cố định đáy cho comment gốc */}
      <div className="fixed bottom-0 left-0 p-4 w-full border-t bg-white">
        <CommentComposer t={t} onSubmit={handleCreateComment} />
      </div>
    </div>
  );
}
