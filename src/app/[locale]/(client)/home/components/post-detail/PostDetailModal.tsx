"use client";

import CommentSection from "@/app/[locale]/(client)/home/components/post-detail/CommentSection";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { Post } from "@/models/Post";
import { X } from "lucide-react";

type Props = {
  t: (key: string) => string;
  post: Post;
  onClose?: () => void;
  onCommentCountChange?: (postId: number, delta: number) => void; // ✅ chữ ký mới
};

export function PostDetailModal({
  t,
  post,
  onClose,
  onCommentCountChange,
}: Props) {
  if (!post) return null;

  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30" />
      <DialogContent
        className="
          w-[90%]
          md:w-full md:max-w-2xl 
          bg-white rounded-2xl shadow-xl 
          p-0 gap-0 overflow-hidden 
          flex flex-col
          data-[state=open]:animate-none
        "
      >
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("postBy")}{" "}
            <span className="text-gray-900">{post.owner.fullName}</span>
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[75vh] scroll-custom">
          <PostCard post={post} isDetail={true} />
          <div className="pt-4">
            {/* ✅ chuyền tiếp (postId, delta) xuống CommentSection */}
            <CommentSection
              t={t}
              postId={post.id}
              onCommentCountChange={(pid, delta) =>
                onCommentCountChange?.(pid, delta)
              }
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
