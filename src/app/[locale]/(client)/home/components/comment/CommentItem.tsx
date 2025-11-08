"use client";

import { useState } from "react";
import CommentComposer from "./CommentComposer";
import CommentReplies from "@/app/[locale]/(client)/home/components/comment/CommentReplies";
import RoundedAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { Comment } from "@/models/Comment";
import { formatTime } from "@/utils/format";
import { commentService } from "@/services/commentService";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useReplies } from "@/app/hooks/useReplies";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

export default function CommentItem({
  t,
  comment,
  seconds,
  isChild = false,
  onDelete,
  onCommentCountChange,
  onCreate,
}: {
  t: (key: string) => string;
  comment: Comment;
  seconds: number;
  isChild?: boolean;
  onDelete: (id: number, childCount: number) => void;
  onCommentCountChange?: (postId: number, delta: number) => void;
  onCreate?: (comment: Comment) => void;
}) {
  const { user } = useAuthStore();
  const [seeReplies, setSeeReplies] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [childCount, setChildCount] = useState(comment.childCount ?? 0);

  const {
    replies,
    loading,
    hasMore,
    loadMore,
    addOptimistic,
    deleteOptimistic,
  } = useReplies(comment.postId, comment.id);

  const handleCreateReply = async (
    content: string,
    mentionUserIds: number[]
  ) => {
    const created = await commentService.createComment({
      postId: comment.postId,
      parentId: comment.parentId ?? comment.id,
      content,
      mentionUserIds,
    });

    if (created) {
      onCreate?.(created);
      onCommentCountChange?.(comment.postId, 1);
      setSeeReplies(true);
      setShowReplyBox(false);
      if (!comment.parentId) {
        addOptimistic(created);
        setChildCount((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="flex gap-2 group">
      {/* Avatar */}
      {comment.user.avatarUrl ? (
        <RoundedAvatar
          userId={comment.user.id}
          avatarUrl={comment.user.avatarUrl}
        />
      ) : (
        <DefaultAvatar
          userId={comment.user.id}
          firstName={comment.user.fullName}
        />
      )}

      <div className="flex flex-col gap-1 w-full">
        {/* Nội dung comment */}
        <div className="flex items-center">
          <div className="bg-gray-100 rounded-xl px-3 py-2 inline-block">
            <UserName
              userId={comment.user.id}
              fullname={comment.user.fullName}
              className="text-sm text-gray-800 font-semibold"
            />
            <div className="text-sm text-gray-800 leading-relaxed">
              {comment.mentions?.length > 0 &&
                comment.mentions.map((m) => (
                  <UserName
                    key={m.id}
                    userId={m.id}
                    fullname={m.fullName}
                    className="font-semibold text-green-600 inline mr-1"
                  />
                ))}

              <span>{comment.contentText}</span>
            </div>
          </div>

          {/* Menu delete */}
          {comment.user.id === user?.id && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="h-8 w-8 flex items-center justify-center 
                               rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-lg leading-none">⋯</span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="start"
                  className="w-28 bg-white rounded-xl shadow-md"
                >
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer hover:bg-red-50"
                    onClick={() => onDelete(comment.id, replies.length)}
                  >
                    {t("delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Actions: thời gian + reply */}
        <div className="flex">
          <div className="ml-2 text-xs text-gray-500">
            {formatTime(seconds, t)}
          </div>
          <div
            className="ml-2 text-xs hover:underline cursor-pointer"
            onClick={() => setShowReplyBox((v) => !v)}
          >
            {t("reply")}
          </div>
        </div>

        {/* Nút xem replies */}
        {comment.childCount! > 0 && !isChild && !seeReplies && (
          <div
            className="ml-2 text-sm text-gray-400 font-semibold cursor-pointer hover:underline hover:text-gray-700 transition"
            onClick={() => setSeeReplies(true)}
          >
            {t("see")} {childCount}{" "}
            {childCount > 1 ? t("replies") : t("reply").toLowerCase()}
          </div>
        )}

        {/* Replies */}
        {seeReplies && childCount > 0 && (
          <CommentReplies
            replies={replies}
            loading={loading}
            hasMore={hasMore}
            loadMore={loadMore}
            addOptimistic={addOptimistic}
            deleteOptimistic={deleteOptimistic}
            onAnyReplyCreated={() => onCommentCountChange?.(comment.postId, 1)}
            onAnyReplyDeleted={() => {
              onCommentCountChange?.(comment.postId, -1);
            }}
          />
        )}

        {/* Composer trả lời */}
        {showReplyBox && (
          <div className="mt-2">
            <CommentComposer
              t={t}
              replyToUser={comment.user}
              onSubmit={handleCreateReply}
            />
          </div>
        )}
      </div>
    </div>
  );
}
