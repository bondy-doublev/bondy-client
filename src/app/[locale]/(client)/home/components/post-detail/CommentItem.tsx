import RoundedAvatar from "@/app/[locale]/(client)/home/components/center-content/RoundedAvatar";
import CommentReplies from "@/app/[locale]/(client)/home/components/post-detail/CommentReplies";
import DefaultAvatar from "@/app/layout/default/DefaultAvatar";
import { Comment } from "@/models/Comment";
import { formatTime } from "@/utils/format";
import { useState } from "react";

export default function CommentItem({
  t,
  comment,
  childCount,
  seconds,
  isChild = false,
}: {
  t: (key: string) => string;
  comment: Comment;
  childCount?: number;
  seconds: number;
  isChild?: boolean;
}) {
  const [seeReplies, setSeeReplies] = useState(false);

  return (
    <div className="flex gap-2">
      {/* Avatar */}
      {comment.user.avatarUrl ? (
        <RoundedAvatar avatarUrl={comment.user.avatarUrl} />
      ) : (
        <DefaultAvatar firstName={comment.user.fullName} />
      )}

      {/* Main content */}
      <div className="flex flex-col gap-1 w-fit">
        <div className="bg-gray-100 rounded-xl px-3 py-2 inline-block">
          <p className="text-sm font-semibold hover:underline cursor-pointer">
            {comment.user.fullName}
          </p>
          <p className="text-sm text-gray-800">{comment.contentText}</p>
        </div>

        <div className="flex">
          <div className="ml-2 text-xs hover:underline cursor-pointer">
            {formatTime(seconds, t)}
          </div>
          <div className="ml-2 text-xs hover:underline cursor-pointer">
            {t("reply")}
          </div>
        </div>

        {childCount! > 0 && !isChild && !seeReplies && (
          <div
            className="ml-2 text-sm text-gray-400 font-semibold cursor-pointer hover:underline hover:text-gray-700 transition"
            onClick={() => {
              setSeeReplies(true);
            }}
          >
            {t("see")} {childCount}{" "}
            {childCount! > 1 ? t("replies") : t("reply").toLowerCase()}
          </div>
        )}

        {/* replies */}
        {seeReplies && (
          <CommentReplies postId={comment.postId} parentId={comment.id} />
        )}
      </div>
    </div>
  );
}
