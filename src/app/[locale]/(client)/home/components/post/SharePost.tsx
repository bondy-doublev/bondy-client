"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import { Feed } from "@/models/Post";
import PostCard from "@/app/[locale]/(client)/home/components/post/PostCard";
import { Button } from "@/components/ui/button";

type Props = {
  feed: Feed;
  onComment: (post: Feed["post"]) => void;
  onDelete?: (postId: number, type: "SHARE") => void;
};

export default function SharePost({ feed, onComment, onDelete }: Props) {
  const { user } = useAuthStore();
  const t = useTranslations("post");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [deleteTimer, setDeleteTimer] = useState<NodeJS.Timeout | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

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

  useEffect(() => {
    if (pendingDelete) {
      onDelete?.(feed.id, "SHARE");
    }
  }, [pendingDelete, onDelete, feed.id]);

  useEffect(() => {
    return () => {
      if (deleteTimer) clearInterval(deleteTimer);
    };
  }, [deleteTimer]);

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

  return (
    <div className="p-4 rounded-xl shadow bg-white">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-bold hover:underline cursor-pointer">
            {user?.id === feed.user.id ? t("you") : feed.user?.fullName}
          </span>{" "}
          {t("sharedPost")}
        </p>

        {feed.user.id === user?.id && (
          <div className="relative mb-2">
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

      {feed.post ? (
        <PostCard
          post={feed.post}
          onComment={() => onComment(feed.post)}
          isSharePost
        />
      ) : (
        <div className="text-sm text-gray-500 italic">
          {t("originalPostDeleted")}
        </div>
      )}
    </div>
  );
}
