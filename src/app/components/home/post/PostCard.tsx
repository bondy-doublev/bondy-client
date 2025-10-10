"use client";

import PostActions from "@/app/components/home/post/PostActions";
import PostContent from "@/app/components/home/post/PostContent";
import PostHeader from "@/app/components/home/post/PostHeader";
import PostStats from "@/app/components/home/post/PostStats";
import { Post } from "@/models/Post";
import { getTimeAgo } from "@/utils/format";
import { useTranslations } from "next-intl";

type Props = {
  post: Post;
};

export default function PostCard({ post }: Props) {
  const t = useTranslations("post");

  return (
    <div className="bg-white rounded-xl shadow space-y-2">
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
      <PostActions t={t} />
    </div>
  );
}
