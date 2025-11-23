"use client";

import PostComposer from "@/app/[locale]/(client)/home/components/composer/PostComposer";
import { PostDetailModal } from "@/app/[locale]/(client)/home/components/post/PostDetailModal";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import SharePost from "@/app/[locale]/(client)/home/components/post/SharePost";
import { Feed } from "@/models/Post";
import User from "@/models/User";
import { feedService } from "@/services/feedService";
import { postService } from "@/services/postService";
import { shareService } from "@/services/shareService";
import { wallService } from "@/services/wallService";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import VisibleReels from "./reel/VisibleReels";

export default function MainFeed({
  className,
  wallOwner,
}: {
  className?: string;
  wallOwner?: User;
}) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [selectedPost, setSelectedPost] = useState<Feed["post"] | null>(null);

  const t = useTranslations("post");

  // Fetch feed
  const fetchFeeds = async (page: number, reset = false) => {
    setLoading(true);
    const newFeeds = wallOwner
      ? await wallService.getWallFeeds({ userId: wallOwner.id, page, size: 5 })
      : await feedService.getFeeds({ page, size: 5 });
    setLoading(false);

    if (!newFeeds || newFeeds.length < 5) {
      setHasMore(false);
    }

    setFeeds((prev) => {
      const merged = reset ? newFeeds : [...prev, ...newFeeds];
      return merged;
    });
  };

  const [isReloading, setIsReloading] = useState(false);

  const reloadFeeds = async () => {
    setIsReloading(true);
    setPage(0);
    setHasMore(true);
    await fetchFeeds(0, true);
    setIsReloading(false);
  };

  useEffect(() => {
    if (!isReloading) {
      fetchFeeds(page);
    }
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

  // Cập nhật commentCount cho post trong feed
  const incPostCommentCount = (postId: number, delta = 1) => {
    setFeeds((prev) =>
      prev.map((f) =>
        f.post && f.post.id === postId
          ? {
              ...f,
              post: {
                ...f.post,
                commentCount: (f.post.commentCount ?? 0) + delta,
              },
            }
          : f
      )
    );

    setSelectedPost((prev) =>
      prev?.id === postId
        ? { ...prev, commentCount: (prev.commentCount ?? 0) + delta }
        : prev
    );
  };

  const handleDelete = async (feedId: number, type: "POST" | "SHARE") => {
    if (type === "POST") {
      await postService.deletePost({ postId: feedId });
      setFeeds((prev) =>
        prev
          .map((f) => {
            if (f.type === "SHARE" && f.post && f.post.id === feedId) {
              // Bài gốc bị xóa -> giữ share lại, set post=null
              return { ...f, post: null };
            }
            if (f.type === "POST" && f.post?.id === feedId) {
              // Xóa bài gốc khỏi feed
              return null;
            }
            return f;
          })
          .filter((f): f is Feed => f !== null)
      );
    } else if (type === "SHARE") {
      await shareService.delete({ shareId: feedId });
      setFeeds((prev) => prev.filter((f) => f.id !== feedId));
    }
  };

  return (
    <div className={`max-w-[500px] space-y-6 mb-4 ${className}`}>
      {/* Reels của tôi + bạn bè */}
      <VisibleReels />

      {/* Composer đăng bài */}
      <PostComposer owner={wallOwner} onPostCreated={reloadFeeds} />

      {/* Hiển thị feed */}
      {feeds.map((feed) => {
        if (feed.type === "POST") {
          if (!feed.post) {
            return (
              <div
                key={`post-${feed.id}`}
                className="p-4 rounded-xl shadow bg-white text-gray-500 italic text-sm"
              >
                {t("originalPostDeleted") ?? "Bài viết này không còn tồn tại."}
              </div>
            );
          }

          return (
            <PostCard
              key={`post-${feed.id}`}
              post={feed.post}
              onComment={() => setSelectedPost(feed.post!)}
              onDelete={handleDelete}
            />
          );
        }

        // SHARE
        return (
          <SharePost
            key={`share-${feed.id}`}
            feed={feed}
            onComment={(post) => setSelectedPost(post)}
            onDelete={handleDelete}
          />
        );
      })}

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
