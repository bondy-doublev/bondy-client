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
};

export function PostDetailModal({ t, post, onClose }: Props) {
  if (!post) return null;

  return (
    <Dialog open={!!post} onOpenChange={onClose}>
      {/* nền mờ nhẹ để nhìn vẫn thấy feed */}
      <DialogOverlay className="fixed inset-0 bg-black/30" />

      <DialogContent
        className="
          w-[90%]
          md:w-full 
          md:max-w-2xl 
          bg-white 
          rounded-2xl 
          shadow-xl 
          p-0 
          gap-0
          overflow-hidden 
          flex 
          flex-col
          data-[state=open]:animate-none
        "
      >
        {/* Header cố định */}
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10">
          {/* Title ở giữa */}
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("postBy")}{" "}
            <span className="text-gray-900">{post.owner.fullName}</span>
          </DialogTitle>

          {/* Nút đóng */}
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Nội dung có thể scroll */}
        <div className="overflow-y-auto max-h-[75vh] scroll-custom">
          <PostCard post={post} isDetail={true} />

          <div className="pt-4">
            <CommentSection t={t} postId={post.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
