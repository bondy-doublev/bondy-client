"use client";

import PostActions from "@/app/[locale]/(client)/home/components/post/PostActions";
import PostContent from "@/app/[locale]/(client)/home/components/post/PostContent";
import PostHeader from "@/app/[locale]/(client)/home/components/post/PostHeader";
import PostStats from "@/app/[locale]/(client)/home/components/post/PostStats";
import { Post } from "@/models/Post";
import { reactionService } from "@/services/reactionService";
import { shareService } from "@/services/shareService";
import { useAuthStore } from "@/store/authStore";
import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import EditPostModal from "@/app/[locale]/(client)/home/components/post/EditPostModal";

type Props = {
  post: Post;
  onComment?: () => void;
  isDetail?: boolean;
  isSharePost?: boolean;
  onDelete?: (postId: number, type: "POST") => void;
};

export default function PostCard({
  post,
  onComment,
  isDetail = false,
  isSharePost = false,
  onDelete,
}: Props) {
  const t = useTranslations("post");
  const { user } = useAuthStore();

  const [editablePost, setEditablePost] = useState<Post>(post);
  const [showEdit, setShowEdit] = useState(false);

  const [reacted, setReacted] = useState(post.reacted ?? false);
  const [likeCount, setLikeCount] = useState(post.reactionCount ?? 0);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false); // ✅ mới thêm

  useEffect(() => {
    // đồng bộ khi prop post thay đổi từ bên ngoài (ví dụ PostDetailModal)
    setEditablePost(post);
    setReacted(post.reacted ?? false);
    setLikeCount(post.reactionCount ?? 0);
    setShareCount(post.shareCount ?? 0);
  }, [post]);

  const handleToggleLike = async () => {
    setReacted((prev) => !prev);
    setLikeCount((prev) => (reacted ? prev - 1 : prev + 1));
    await reactionService.toggleReaction({ postId: post.id });
  };

  const handleShare = async () => {
    setShareCount((prev) => prev + 1);
    await shareService.create({ postId: post.id });
  };

  const handleDeletePost = () => {
    setIsDeleted(true);
    setDeleteCountdown(10);
    setPendingDelete(false); // reset

    const timer = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPendingDelete(true); // ✅ báo hiệu đã đến lúc xóa
        }
        return prev - 1;
      });
    }, 1000);

    setDeleteTimer(timer);
  };

  const handleUndoDelete = () => {
    if (deleteTimer) clearInterval(deleteTimer);
    setIsDeleted(false);
    setPendingDelete(false);
  };

  // ✅ useEffect để gọi onDelete sau khi render xong
  useEffect(() => {
    if (pendingDelete) {
      onDelete?.(post.id, "POST");
    }
  }, [pendingDelete, onDelete, post.id]);

  // Dọn timer khi unmount
  useEffect(() => {
    return () => {
      if (deleteTimer) clearInterval(deleteTimer);
    };
  }, [deleteTimer]);

  if (isDeleted) {
    return (
      <div className="text-sm bg-gray-50 border rounded-xl p-4 flex justify-between items-center">
        <span>
          {t("undoDeleteMessage")} <b>{deleteCountdown}s</b>.
        </span>
        <Button
          variant="link"
          className="text-blue-600 underline px-2"
          onClick={handleUndoDelete}
        >
          {t("undo")}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`text-sm bg-white rounded-xl space-y-2 ${
        !isDetail ? "shadow" : ""
      }`}
    >
      <PostHeader
        t={t}
        owner={editablePost.owner}
        seconds={getTimeAgo(editablePost.createdAt)}
        taggedUsers={editablePost.taggedUsers}
        isOwner={editablePost.owner.id === user?.id}
        isSharePost={isSharePost}
        isPublic={editablePost.visibility}
        onDelete={handleDeletePost}
        onEdit={() => setShowEdit(true)}
      />
      <PostContent
        content={editablePost.contentText}
        mediaAttachments={editablePost.mediaAttachments}
      />
      <PostStats
        t={t}
        likes={likeCount}
        comments={editablePost.commentCount}
        shares={shareCount}
        onComment={onComment}
      />
      <PostActions
        t={t}
        onComment={onComment}
        reacted={reacted}
        onToggleLike={handleToggleLike}
        onShare={handleShare}
      />
      {/* ✅ Modal sửa bài */}
      {showEdit && (
        <EditPostModal
          t={t}
          open={showEdit}
          onClose={() => setShowEdit(false)}
          post={editablePost}
          onSaved={(updated) => {
            setEditablePost((prev) => ({
              ...prev,
              contentText: updated.contentText,
              taggedUsers: updated.taggedUsers,
              mediaAttachments: updated.mediaAttachments,
              mediaCount: updated.mediaAttachments?.length ?? 0,
              reactionCount: updated.reactionCount ?? prev.reactionCount,
              shareCount: updated.shareCount ?? prev.shareCount,
              commentCount: updated.commentCount ?? prev.commentCount,
              visibility: updated.visibility ?? prev.visibility,
            }));
          }}
        />
      )}
    </div>
  );
}
