"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import { Post } from "@/models/Post";

import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

type Props = {
  post: Post; // chính là share-post (có sharedFrom)
  onComment: (post: Post) => void;
  onDelete?: (postId: number, type: "SHARE") => void;
};

// unuse
export default function SharePost({ post, onComment, onDelete }: Props) {
  const { user } = useAuthStore();
  const t = useTranslations("post");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Bắt đầu đếm ngược xoá share
  const handleDeleteShare = () => {
    setIsDeleted(true);
    setDeleteCountdown(10);
    setPendingDelete(false);

    const timer = setInterval(() => {
      setDeleteCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPendingDelete(true);
        }
        return prev - 1;
      });
    }, 1000);

    setDeleteTimer(timer);
    setIsMenuOpen(false);
  };

  const handleUndoDelete = () => {
    if (deleteTimer) clearInterval(deleteTimer);
    setIsDeleted(false);
    setPendingDelete(false);
  };

  // Sau khi đếm ngược xong thì xoá thật (call parent)
  useEffect(() => {
    if (pendingDelete) {
      onDelete?.(post.id, "SHARE");
    }
  }, [pendingDelete, onDelete, post.id]);

  // Dọn timer khi unmount
  useEffect(() => {
    return () => {
      if (deleteTimer) clearInterval(deleteTimer);
    };
  }, [deleteTimer]);

  if (!user) return null;

  if (isDeleted) {
    return (
      <div className="text-sm bg-gray-50 border rounded-xl p-4 flex justify-between items-center">
        <span>
          {t("undoDeleteShareMessage") ?? "Bạn vừa xóa bài chia sẻ này."}{" "}
          <b>{deleteCountdown}s</b>.
        </span>
        <Button
          variant="link"
          className="text-blue-600 underline px-2"
          onClick={handleUndoDelete}
        >
          {t("undo")}
        </Button>
      </div>
    );
  }

  const sharer = post.owner;
  const original = post.sharedFrom ?? null;

  return (
    <div className="p-4 rounded-xl shadow bg-white">
      <div className="flex justify-between items-center">
        <Link href={"/user/" + sharer.id}>
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-bold hover:underline cursor-pointer">
              {user.id === sharer.id ? t("you") : sharer.fullName}
            </span>{" "}
            {t("sharedPost")}
          </p>
        </Link>

        {/* Menu xoá share */}
        {sharer.id === user.id && (
          <div className="relative mb-2" ref={menuRef}>
            <button
              className="w-8 h-8 rounded-full hover:bg-gray-100"
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              ⋯
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md text-sm z-10">
                <button
                  className="w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                  onClick={handleDeleteShare}
                >
                  {t("delete")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bài gốc */}
      {original ? (
        <PostCard post={original} onComment={() => onComment(original)} />
      ) : (
        <div className="text-sm text-gray-500 italic">
          {t("originalPostDeleted")}
        </div>
      )}
    </div>
  );
}
