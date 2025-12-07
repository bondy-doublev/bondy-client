"use client";

import PostActions from "@/app/[locale]/(client)/home/components/post/PostActions";
import PostContent from "@/app/[locale]/(client)/home/components/post/PostContent";
import PostHeader from "@/app/[locale]/(client)/home/components/post/PostHeader";
import PostStats from "@/app/[locale]/(client)/home/components/post/PostStats";
import EditPostModal from "@/app/[locale]/(client)/home/components/post/EditPostModal";
import ShareModal from "@/app/[locale]/(client)/home/components/post/ShareModal";

import { Post } from "@/models/Post";
import { reactionService } from "@/services/reactionService";
import { shareService } from "@/services/shareService";
import { moderationService } from "@/services/reportService";
import { TargetType } from "@/models/Report";

import { useAuthStore } from "@/store/authStore";
import { useMyFriends } from "@/app/hooks/useMyFriends";

import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  post: Post;
  onComment?: () => void;
  isDetail?: boolean;
  isSharePost?: boolean; // giờ chỉ để header hiển thị kiểu "A đã chia sẻ"
  onDelete?: (postId: number, type: "POST" | "SHARE") => void;
};

export default function PostCard({
  post,
  onComment,
  isDetail = false,
  isSharePost = false,
  onDelete,
}: Props) {
  const router = useRouter();

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
  const [pendingDelete, setPendingDelete] = useState(false);

  // state cho ShareModal
  const [showShareModal, setShowShareModal] = useState(false);

  const currentUserId = user?.id ?? 0;
  const { friendUsers } = useMyFriends(currentUserId);

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

  const handleOpenShareModal = () => {
    setShowShareModal(true);
  };

  const handleDeletePost = () => {
    setIsDeleted(true);
    setDeleteCountdown(10);
    setPendingDelete(false);

    const timer = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPendingDelete(true);
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

  // Gọi onDelete sau khi render xong
  useEffect(() => {
    if (pendingDelete) {
      // share hay không share thì vẫn là 1 Post id
      onDelete?.(post.id, editablePost.sharedFrom ? "SHARE" : "POST");
    }
  }, [pendingDelete, onDelete, post.id, editablePost.sharedFrom]);

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

  const handleSubmitReport = async (reason: string) => {
    await moderationService.createReport({
      targetType: TargetType.POST,
      targetId: post.id,
      reason,
    });
  };

  // Handler cho ShareModal - share lên tường
  const handleShareToFeed = async ({
    message,
    isPublic,
  }: {
    message: string;
    isPublic: boolean;
  }) => {
    await shareService.create({
      postId: editablePost.id,
      message,
      isPublic,
    });
    setShareCount((prev) => prev + 1);
  };

  // Handler cho ShareModal - gửi tin nhắn cho bạn bè
  const handleSendAsMessage = async ({
    message,
    friendIds,
  }: {
    message: string;
    friendIds: number[];
  }) => {
    // TODO: tuỳ backend, bạn có thể dùng service khác (messageService)
    await shareService.sendAsMessage?.({
      postId: editablePost.id,
      message,
      receiverIds: friendIds,
    });
  };

  const handleGoToDetail = (postId: number) => {
    router.push(`/post/${post.id}/detail`);
  };

  const original = editablePost.sharedFrom ?? null;

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
        isPublic={editablePost.visibility}
        onDelete={handleDeletePost}
        onEdit={() => setShowEdit(true)}
        onReport={handleSubmitReport}
        onGoDetail={() => handleGoToDetail(post.id)}
      />

      {/* Nội dung của bài share / bài thường */}
      <PostContent
        content={editablePost.contentText}
        mediaAttachments={editablePost.mediaAttachments}
      />

      {/* Nếu là bài share, hiển thị bài gốc như 1 post bình thường (không có stats/actions) */}
      {original && (
        <div className="mx-4 border rounded-xl overflow-hidden">
          {/* Header bài gốc */}
          <div className="">
            <PostHeader
              t={t}
              owner={original.owner}
              seconds={getTimeAgo(original.createdAt)}
              taggedUsers={original.taggedUsers}
              isOwner={original.owner.id === user?.id}
              isSharePost={false}
              isPublic={original.visibility}
              // không cho sửa/xoá/report từ card lồng bên trong
              onDelete={undefined}
              onEdit={undefined}
              onReport={undefined}
              isShareFromPost={true}
              onGoDetail={() => handleGoToDetail(original.id)}
            />
          </div>

          {/* Content bài gốc */}
          <div className="py-2">
            <PostContent
              content={original.contentText}
              mediaAttachments={original.mediaAttachments}
            />
          </div>
        </div>
      )}

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
        onShare={handleOpenShareModal}
        isSharePost={!!original}
      />

      {/* Modal sửa bài */}
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

      {/* ShareModal giống Facebook */}
      {showShareModal && (
        <ShareModal
          t={t}
          open={showShareModal}
          onClose={() => setShowShareModal(false)}
          friends={friendUsers.map((f) => ({
            id: f.id,
            fullName: f.fullName,
            avatarUrl: f.avatarUrl,
          }))}
          originalPostPreview={
            original ? (
              <div className="bg-gray-50 border rounded-lg overflow-hidden">
                <div className="px-3 pt-2 pb-1 text-sm font-semibold text-gray-800">
                  {original.owner.fullName}
                </div>
                <div className="px-3 pb-3">
                  <PostContent
                    content={original.contentText}
                    mediaAttachments={original.mediaAttachments}
                  />
                </div>
              </div>
            ) : (
              <PostContent
                content={editablePost.contentText}
                mediaAttachments={editablePost.mediaAttachments}
              />
            )
          }
          onShareToFeed={handleShareToFeed}
          onSendAsMessage={handleSendAsMessage}
        />
      )}
    </div>
  );
}
