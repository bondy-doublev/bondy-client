"use client";

import CommentSection from "@/app/[locale]/(client)/home/components/post-detail/CommentSection";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import DefaultAvatar from "@/app/layout/default/DefaultAvatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Post } from "@/models/Post";
import { X } from "lucide-react";
import { IoSend } from "react-icons/io5";

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
          w-full 
          max-w-2xl 
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
          <PostCard post={post} isDetail />

          <div className="border-t border-gray-50 pt-4">
            <CommentSection t={t} postId={post.id} />
          </div>
        </div>

        <div className="p-4 flex items-center gap-2 border-t-0.5 justify-center h-18 border-b top-0 bg-white z-10">
          <DefaultAvatar />
          <Input
            className="flex-1 rounded-2xl shadow-none focus:shadow-none focus-visible:ring-0 focus:ring-0 focus:outline-none"
            placeholder="Write comment..."
          />
          <Button
            type="submit"
            className=" h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-green-600 shadow-none focus:outline-none focus:ring-0 transition "
          >
            <IoSend size={18} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
