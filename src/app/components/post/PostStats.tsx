"use client";
import { useTranslations } from "next-intl";

export default function PostStats({
  likes,
  comments,
  shares,
  t,
}: {
  likes: number;
  comments: number;
  shares: number;
  t: (key: string) => string;
}) {
  return (
    <div className="flex justify-between pt-2 px-4 text-gray-600 text-sm">
      <div className="text-sm text-gray-700 space-y-1 flex justify-between w-full">
        {/* Lượt thích */}
        <div className="cursor-pointer hover:underline">
          {likes} {t("like").toLowerCase()}
          {likes > 1 ? "s" : ""}
        </div>

        {/* Bình luận + Chia sẻ */}
        <div className="flex gap-2 justify-around text-gray-600">
          <div className="cursor-pointer hover:underline">
            {comments} {t("comment").toLowerCase()}
            {comments > 1 ? "s" : ""}
          </div>
          <div className="cursor-pointer hover:underline">
            {shares} {t("share").toLowerCase()}
            {comments > 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
