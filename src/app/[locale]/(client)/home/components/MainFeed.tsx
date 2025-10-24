"use client";
import PostComposer from "@/app/[locale]/(client)/home/components/composer/PostComposer";
import { PostDetailModal } from "@/app/[locale]/(client)/home/components/post-detail/PostDetailModal";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import Stories from "@/app/[locale]/(client)/home/components/Stories";
import { Post } from "@/models/Post";
import { postService } from "@/services/postService";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

export default function MainFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const t = useTranslations("post");

  const fetchPosts = async (page: number, reset = false) => {
    setLoading(true);
    const newPosts = await postService.getNewfeed({ page, size: 5 });
    setLoading(false);

    if (!newPosts || newPosts.length === 0) {
      setHasMore(false);
      return;
    }

    setPosts((prev) => {
      const merged = reset ? newPosts : [...prev, ...newPosts];
      const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values());
      return unique;
    });
  };

  const reloadPosts = async () => {
    setPage(0);
    setHasMore(true);
    await fetchPosts(0, true);
  };

  useEffect(() => {
    fetchPosts(page);
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

  // ✅ Cập nhật commentCount theo postId + delta
  const incPostCommentCount = (postId: number, delta = 1) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, commentCount: (p.commentCount ?? 0) + delta }
          : p
      )
    );
    setSelectedPost((prev) =>
      prev?.id === postId
        ? { ...prev, commentCount: (prev.commentCount ?? 0) + delta }
        : prev
    );
  };

  return (
    <div className="flex-1 max-w-[500px] space-y-6">
      <PostComposer onPostCreated={reloadPosts} />
      <Stories />

      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onComment={() => setSelectedPost(post)}
        />
      ))}

      {hasMore ? (
        <div ref={loaderRef} className="text-center py-6 text-gray-500">
          {loading ? t("loading") : t("scrollToLoadMore")}
        </div>
      ) : !hasMore && page > 0 ? (
        <div className="text-center py-4 text-gray-400">{t("noMorePost")}</div>
      ) : (
        <div className="text-center py-4 text-gray-400">{t("noPost")}</div>
      )}

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
