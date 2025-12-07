"use client";

import PostComposer from "@/app/[locale]/(client)/home/components/composer/PostComposer";
import { PostDetailModal } from "@/app/[locale]/(client)/home/components/post/PostDetailModal";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import VisibleReels from "./reel/VisibleReels";

import { Post } from "@/models/Post";
import User from "@/models/User";

import { feedService } from "@/services/feedService";
import { postService } from "@/services/postService";
import { wallService } from "@/services/wallService";

import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  className?: string;
  wallOwner?: User;
};

export default function MainFeed({ className, wallOwner }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const [isReloading, setIsReloading] = useState(false);

  const t = useTranslations("post");

  const PAGE_SIZE = 5;

  // Fetch feed (giờ trả về Post[])
  const fetchPosts = async (page: number, reset = false) => {
    setLoading(true);

    const newPosts: Post[] = wallOwner
      ? await wallService.getWallFeeds({
          userId: wallOwner.id,
          page,
          size: PAGE_SIZE,
        })
      : await feedService.getFeeds({ page, size: PAGE_SIZE });

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
  }, [page]);

  // Infinite scroll
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

  // Cập nhật commentCount cho post trong feed (kể cả trong sharedFrom)
  const incPostCommentCount = (postId: number, delta = 1) => {
    setPosts((prev) =>
      prev.map((p) => {
        // nếu là bài đó
        if (p.id === postId) {
          return {
            ...p,
            commentCount: (p.commentCount ?? 0) + delta,
          };
        }

        // nếu là bài share chứa original post
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

  // Xoá 1 post (gồm cả share-post)
  const handleDelete = async (postId: number, _type: "POST" | "SHARE") => {
    // backend giờ chỉ còn deletePost, share cũng là 1 post
    await postService.deletePost({ postId });

    setPosts((prev) =>
      prev
        .map((p) => {
          // Xoá chính bài này
          if (p.id === postId) return null;

          // Nếu post gốc bị xóa -> các bài share giữ lại, set sharedFrom = null
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

    // Nếu modal đang mở đúng bài này thì đóng
    setSelectedPost((prev) => (prev?.id === postId ? null : prev));
  };

  return (
    <div className={`max-w-[500px] space-y-6 mb-4 ${className ?? ""}`}>
      {/* Reels của tôi + bạn bè */}
      {!wallOwner && <VisibleReels />}

      {/* Composer đăng bài */}
      <PostComposer owner={wallOwner} onPostCreated={reloadFeeds} />

      {/* Hiển thị feed: MỖI POST LÀ PostCard, kể cả share-post */}
      {posts.map((post, index) => (
        <PostCard
          key={index}
          post={post}
          isSharePost={!!post.sharedFrom}
          onComment={() => setSelectedPost(post)}
          onDelete={handleDelete}
        />
      ))}

      {/* Infinite scroll loader */}
      {hasMore && (
        <div ref={loaderRef} className="text-center py-6 text-gray-500">
          {loading ? t("loading") : t("scrollToLoadMore")}
        </div>
      )}

      {/* Modal chi tiết bài viết */}
      {selectedPost && (
        <PostDetailModal
          t={t}
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onCommentCountChange={(postId, delta) =>
            incPostCommentCount(postId, delta)
          }
          onDeletePost={handleDelete}
        />
      )}
    </div>
  );
}
