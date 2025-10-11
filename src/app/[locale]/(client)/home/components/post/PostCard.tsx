"use client";

import PostActions from "@/app/[locale]/(client)/home/components/post/PostActions";
import PostContent from "@/app/[locale]/(client)/home/components/post/PostContent";
import PostHeader from "@/app/[locale]/(client)/home/components/post/PostHeader";
import PostStats from "@/app/[locale]/(client)/home/components/post/PostStats";
import { Post } from "@/models/Post";
import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";

type Props = {
  post: Post;
  onComment?: () => void;
  isDetail?: boolean;
};

export default function PostCard({ post, onComment, isDetail = false }: Props) {
  const t = useTranslations("post");

  return (
    <div
      className={`bg-white rounded-xl space-y-2 ${!isDetail ? "shadow" : ""}`}
    >
      <PostHeader
        t={t}
        name={post.owner.fullName}
        seconds={getTimeAgo(post.createdAt)}
        avatarUrl={post.owner.avatarUrl}
      />
      <PostContent
        content={post.contentText}
        urls={post.mediaAttachments.map((m) => m.url) ?? []}
      />
      <PostStats
        t={t}
        likes={post.reactionCount}
        comments={post.commentCount}
        shares={post.shareCount}
      />
      <PostActions t={t} onComment={onComment} />
    </div>
  );
}
