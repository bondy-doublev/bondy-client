"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "use-intl";
import { HiShare } from "react-icons/hi";
import { resolveFileUrl } from "@/utils/fileUrl";

interface SharedPostCardProps {
  sharedPost: {
    postId?: number;
    title?: string;
    image?: string;
    link?: string;
    authorName?: string;
    authorAvatar?: string;
  };
  isMine: boolean;
}

export function SharedPostCard({ sharedPost, isMine }: SharedPostCardProps) {
  const router = useRouter();
  const t = useTranslations("chat");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sharedPost?.link) {
      router.push(sharedPost.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`mt-2 rounded-lg overflow-hidden cursor-pointer border ${
        isMine
          ? "bg-white border-gray-200 hover:border-gray-300"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Badge - Shared Post Indicator */}
      <div className="px-3 py-2 flex items-center gap-2 bg-gray-50 border-b border-gray-200">
        <HiShare className="w-4 h-4 text-gray-600" />
        <span className="text-xs font-medium text-gray-700">
          {t("sharedPost")}
        </span>
      </div>

      {/* Image */}
      {sharedPost.image && (
        <div className="w-full aspect-video bg-gray-100 relative overflow-hidden">
          <img
            src={resolveFileUrl(sharedPost.image)}
            alt={sharedPost.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
          {sharedPost.title}
        </h4>

        {/* Author Info */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
            {sharedPost.authorAvatar ? (
              <img
                src={resolveFileUrl(sharedPost.authorAvatar)}
                alt={sharedPost.authorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center text-white font-medium text-xs">
                {sharedPost?.authorName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 truncate">
              {sharedPost.authorName || t("unknown")}
            </p>
          </div>
        </div>

        {/* View Link */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 rounded bg-gray-900 hover:bg-gray-800 text-white cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <span className="text-sm font-medium">{t("viewPost")}</span>
        </div>
      </div>
    </div>
  );
}
