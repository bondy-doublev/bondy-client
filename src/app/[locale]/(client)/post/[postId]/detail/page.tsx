"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { Post } from "@/models/Post";
import { postService } from "@/services/postService";
import { PostDetailModal } from "@/app/[locale]/(client)/home/components/post/PostDetailModal";
import Loader from "@/app/components/ui/loader/Loader";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("post");

  const postIdParam = params?.postId as string | undefined;
  const postId = postIdParam ? Number(postIdParam) : NaN;

  const [post, setPost] = useState<Post | null>(null);
  const [ready, setReady] = useState(false); // chỉ true khi: data xong + delay >= 2s

  useEffect(() => {
    let cancelled = false;

    if (!postId || Number.isNaN(postId)) {
      if (!cancelled) {
        router.back();
      }

      return () => {
        cancelled = true;
      };
    }

    const load = async () => {
      const delayPromise = new Promise<void>(
        (resolve) => setTimeout(resolve, 1000) // tối thiểu 2s
      );

      const fetchPromise = (async () => {
        try {
          const data = await postService.getPost(postId);
          return data as Post | null;
        } catch (e) {
          console.error("Failed to fetch post detail", e);
          return null;
        }
      })();

      const [_, fetchedPost] = await Promise.all([delayPromise, fetchPromise]);

      if (cancelled) return;

      if (!fetchedPost) {
        router.back();
        return;
      }

      setPost(fetchedPost);
      setReady(true);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [postId, router]);

  if (!ready || !post) {
    return <Loader loading={!ready} type="success"></Loader>;
  }

  return (
    <PostDetailModal
      t={t}
      post={post}
      onClose={() => router.back()}
      onCommentCountChange={(pid, delta) => {
        setPost((prev) =>
          prev && prev.id === pid
            ? { ...prev, commentCount: (prev.commentCount ?? 0) + delta }
            : prev
        );
      }}
      onDeletePost={async (postId, _type) => {
        try {
          await postService.deletePost({ postId });
        } finally {
          router.back();
        }
      }}
    />
  );
}
