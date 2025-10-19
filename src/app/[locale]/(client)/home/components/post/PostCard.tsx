"use client";

import PostActions from "@/app/[locale]/(client)/home/components/post/PostActions";
import PostContent from "@/app/[locale]/(client)/home/components/post/PostContent";
import PostHeader from "@/app/[locale]/(client)/home/components/post/PostHeader";
import PostStats from "@/app/[locale]/(client)/home/components/post/PostStats";
import { Post } from "@/models/Post";
import { reactionService } from "@/services/reactionService";
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
  const [reacted, setReacted] = useState(post.reacted ?? false);
  const [likeCount, setLikeCount] = useState(post.reactionCount ?? 0);

  const handleToggleLike = async () => {
    setReacted((prev) => !prev);
    setLikeCount((prev) => (reacted ? prev - 1 : prev + 1));

    await reactionService.toggleReaction({ postId: post.id });
  };

  return (
    <div
      className={`text-sm bg-white rounded-xl space-y-2 ${
        !isDetail ? "shadow" : ""
      }`}
    >
      <PostHeader
        t={t}
        name={post.owner.fullName}
        seconds={getTimeAgo(post.createdAt)}
        avatarUrl={post.owner.avatarUrl}
        taggedUsers={post.taggedUsers}
      />
      <PostContent
        content={post.contentText}
        urls={post.mediaAttachments.map((m) => m.url) ?? []}
      />
      <PostStats
        t={t}
        likes={likeCount}
        comments={post.commentCount}
        shares={post.shareCount}
        onComment={onComment}
      />
      <PostActions
        t={t}
        onComment={onComment}
        reacted={reacted}
        onToggleLike={handleToggleLike}
      />
    </div>
  );
}
