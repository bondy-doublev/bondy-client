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
import { useState } from "react";

type Props = {
  post: Post;
  onComment?: () => void;
  isDetail?: boolean;
};

export default function PostCard({ post, onComment, isDetail = false }: Props) {
  const t = useTranslations("post");
  const { user } = useAuthStore();

  const [reacted, setReacted] = useState(post.reacted ?? false);
  const [likeCount, setLikeCount] = useState(post.reactionCount ?? 0);
  const [shareCount, setShareCount] = useState(post.shareCount ?? 0);

  const handleToggleLike = async () => {
    setReacted((prev) => !prev);
    setLikeCount((prev) => (reacted ? prev - 1 : prev + 1));

    await reactionService.toggleReaction({ postId: post.id });
  };

  const handleShare = async () => {
    setShareCount((prev) => prev + 1);

    await shareService.create({ postId: post.id });
  };

  return (
    <div
      className={`text-sm bg-white rounded-xl space-y-2 ${
        !isDetail ? "shadow" : ""
      }`}
    >
      <PostHeader
        t={t}
        owner={post.owner}
        seconds={getTimeAgo(post.createdAt)}
        taggedUsers={post.taggedUsers}
        isOwner={post.owner.id === user?.id}
      />
      <PostContent
        content={post.contentText}
        mediaAttachments={post.mediaAttachments}
      />
      <PostStats
        t={t}
        likes={likeCount}
        comments={post.commentCount}
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
    </div>
  );
}
