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
          {likes}{" "}
          {likes > 1 ? t("likes").toLowerCase() : t("like").toLowerCase()}
        </div>

        {/* Bình luận + Chia sẻ */}
        <div className="flex gap-2 justify-around text-gray-600">
          <div className="cursor-pointer hover:underline">
            {comments}{" "}
            {comments > 1
              ? t("comments").toLowerCase()
              : t("comment").toLowerCase()}
          </div>
          <div className="cursor-pointer hover:underline">
            {shares}{" "}
            {shares > 1 ? t("shares").toLowerCase() : t("share").toLowerCase()}
          </div>
        </div>
      </div>
    </div>
  );
}
