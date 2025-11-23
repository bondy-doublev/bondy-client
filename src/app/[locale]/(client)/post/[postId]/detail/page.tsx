"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileWarning } from "lucide-react";

import { Post } from "@/models/Post";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import CommentSection from "@/app/[locale]/(client)/home/components/comment/CommentSection";
import { postService } from "@/services/postService";
import { Button } from "@/components/ui/button";

export default function PostDetail() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("post");

  const postIdParam = params?.postId as string | undefined;
  const postId = postIdParam ? Number(postIdParam) : NaN;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ===============================
  // Fetch post
  // ===============================
  useEffect(() => {
    if (!postId || Number.isNaN(postId)) {
      setError("Invalid post id");
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await postService.getPost(postId);
        setPost(data);
      } catch (e: any) {
        console.error("Failed to fetch post detail", e);
        setError(e?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleCommentCountChange = (pid: number, delta: number) => {
    setPost((prev) =>
      prev && prev.id === pid
        ? { ...prev, commentCount: (prev.commentCount || 0) + delta }
        : prev
    );
  };

  const handleDeletePost = () => {
    router.back();
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header ĐẸP – kiểu FB */}
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="mx-auto w-full max-w-3xl flex items-center gap-3 px-3 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Back"
          >
            <ArrowLeft size={18} className="text-gray-700" />
          </button>

          <div className="flex flex-col leading-tight">
            <span className="text-[15px] font-semibold text-gray-900">
              {t("postDetailTitle") ?? "Bài viết"}
            </span>

            {post && (
              <span className="text-xs text-gray-500">
                {t("postBy") ?? "Bài viết của"}{" "}
                <span className="font-medium text-gray-700">
                  {post.owner.fullName}
                </span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="mx-auto w-full max-w-3xl px-2 sm:px-0 py-4 border-none">
        {/* Loading */}
        {loading && (
          <div className="bg-white border rounded-xl px-4 py-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-3/5 bg-gray-100 rounded animate-pulse" />
            </div>
            <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse" />
          </div>
        )}

        {/* Error */}
        {!loading && (error || !post) && (
          <div className="bg-white border rounded-xl px-6 py-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
              <FileWarning className="w-6 h-6 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {t("notFoundTitle") ?? "Không tìm thấy bài viết"}
            </p>
            <p className="text-xs text-gray-500 mb-5">
              {t("notFound") ??
                "Bài viết có thể đã bị xoá hoặc bạn không có quyền xem."}
            </p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={16} />
              <span>{t("back") ?? "Quay lại"}</span>
            </Button>
          </div>
        )}

        {/* Post + Comment LIỀN MẠCH – nhẹ nhàng */}
        {!loading && post && (
          <section className="bg-white border rounded-xl overflow-hidden">
            {/* Post */}
            <PostCard
              post={post}
              isDetail
              onDelete={() => handleDeletePost()}
            />

            {/* Comment: max-height + scroll + composer dính đáy */}
            <CommentSection
              t={t}
              postId={post.id}
              mode="page"
              onCommentCountChange={handleCommentCountChange}
            />
          </section>
        )}
      </main>
    </div>
  );
}
