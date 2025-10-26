"use client";

import PostComposer from "@/app/[locale]/(client)/home/components/composer/PostComposer";
import { PostDetailModal } from "@/app/[locale]/(client)/home/components/post-detail/PostDetailModal";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import { Feed } from "@/models/Post";
import User from "@/models/User";
import { feedService } from "@/services/feedService";
import { wallService } from "@/services/wallService";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

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
  const { user } = useAuthStore();

  // Fetch feed
  const fetchFeeds = async (page: number, reset = false) => {
    setLoading(true);
    const newFeeds = wallOwner
      ? await wallService.getWallFeeds({ userId: wallOwner.id, page, size: 5 })
      : await feedService.getFeeds({ page, size: 5 });
    setLoading(false);

    console.log(newFeeds);

    if (!newFeeds || newFeeds.length < 5) {
      setHasMore(false);
    }

    setFeeds((prev) => {
      const merged = reset ? newFeeds : [...prev, ...newFeeds];
      // const unique = Array.from(new Map(merged.map((f) => [f.id, f])).values());
      return merged;
    });
  };

  // Reload feed (sau khi đăng post mới)
  const reloadFeeds = async () => {
    setPage(0);
    setHasMore(true);
    await fetchFeeds(0, true);
  };

  // Fetch khi page thay đổi
  useEffect(() => {
    fetchFeeds(page);
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
        f.post.id === postId
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

  return (
    <div className={`flex-1 max-w-[500px] space-y-6 mb-4 ${className}`}>
      {/* Composer đăng bài */}
      <PostComposer owner={wallOwner} onPostCreated={reloadFeeds} />

      {/* <Stories /> */}

      {/* Hiển thị feed */}
      {feeds.map((feed) =>
        feed.type === "POST" ? (
          <PostCard
            key={`post-${feed.id}`}
            post={feed.post}
            onComment={() => setSelectedPost(feed.post)}
          />
        ) : (
          <div
            key={`share-${feed.id}`}
            className="p-4 rounded-xl shadow bg-white"
          >
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-bold hover:underline cursor-pointer">
                {user?.id === feed.user.id ? t("you") : feed.user?.fullName}
              </span>{" "}
              {t("sharedPost")}
            </p>
            {feed.post && (
              <PostCard
                post={feed.post}
                onComment={() => setSelectedPost(feed.post)}
              />
            )}
          </div>
        )
      )}

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
        />
      )}
    </div>
  );
}
