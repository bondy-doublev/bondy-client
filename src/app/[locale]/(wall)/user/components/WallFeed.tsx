// WallFeed.tsx
"use client";

import PostComposer from "@/app/[locale]/(client)/home/components/composer/PostComposer";
import { PostDetailModal } from "@/app/[locale]/(client)/home/components/post/PostDetailModal";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";

import { Post } from "@/models/Post";
import User from "@/models/User";

import { wallService } from "@/services/wallService";
import { postService } from "@/services/postService";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";

type Props = {
  className?: string;
  wallOwner: User; // tường thì bắt buộc phải có owner
};

export default function WallFeed({ className, wallOwner }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  const { user } = useAuthStore();

  const t = useTranslations("post");
  const PAGE_SIZE = 5;

  const fetchPosts = async (page: number, reset = false) => {
    setLoading(true);

    const newPosts: Post[] = await wallService.getWallFeeds({
      userId: wallOwner.id,
      page,
      size: PAGE_SIZE,
    });

    setLoading(false);

    if (!newPosts || newPosts.length < PAGE_SIZE) {
      setHasMore(false);
    }

    setPosts((prev) => {
      const merged = reset ? newPosts : [...prev, ...newPosts];
      return merged;
    });
  };

  const reloadFeeds = async () => {
    setIsReloading(true);
    setPage(0);
    setHasMore(true);
    await fetchPosts(0, true);
    setIsReloading(false);
  };

  useEffect(() => {
    if (!isReloading) {
      fetchPosts(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, wallOwner.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.2 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  const incPostCommentCount = (postId: number, delta = 1) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentCount: (p.commentCount ?? 0) + delta,
          };
        }

        if (p.sharedFrom && p.sharedFrom.id === postId) {
          return {
            ...p,
            sharedFrom: {
              ...p.sharedFrom,
              commentCount: (p.sharedFrom.commentCount ?? 0) + delta,
            },
          };
        }

        return p;
      })
    );

    setSelectedPost((prev) =>
      prev && prev.id === postId
        ? { ...prev, commentCount: (prev.commentCount ?? 0) + delta }
        : prev
    );
  };

  const handleDelete = async (postId: number, _type: "POST" | "SHARE") => {
    await postService.deletePost({ postId });

    setPosts((prev) =>
      prev
        .map((p) => {
          if (p.id === postId) return null;

          if (p.sharedFrom && p.sharedFrom.id === postId) {
            return {
              ...p,
              sharedFrom: null,
            };
          }

          return p;
        })
        .filter((p): p is Post => p !== null)
    );

    setSelectedPost((prev) => (prev?.id === postId ? null : prev));
  };

  const isOwner = user?.id === wallOwner.id;

  return (
    <div className={`space-y-6 mb-4 ${className ?? ""}`}>
      {/* Tường user: không Reels, nhưng Composer gắn owner */}
      {isOwner && (
        <PostComposer owner={wallOwner} onPostCreated={reloadFeeds} />
      )}

      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          isSharePost={!!post.sharedFrom}
          onComment={() => setSelectedPost(post)}
          onDelete={handleDelete}
        />
      ))}

      {hasMore && (
        <div ref={loaderRef} className="text-center py-6 text-gray-500">
          {loading ? t("loading") : t("scrollToLoadMore")}
        </div>
      )}

      {selectedPost && (
        <PostDetailModal
          t={t}
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onCommentCountChange={incPostCommentCount}
          onDeletePost={handleDelete}
        />
      )}
    </div>
  );
}
