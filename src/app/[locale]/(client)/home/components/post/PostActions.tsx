import { FaHeart, FaRegComment, FaShare } from "react-icons/fa";
import { BiLike, BiSolidLike } from "react-icons/bi";

export default function PostActions({
  t,
  onComment,
  reacted,
  onToggleLike,
}: {
  t: (key: string) => string;
  onComment?: () => void;
  onReaction?: () => void;
  reacted: boolean;
  onToggleLike: () => void;
}) {
  return (
    <div className="w-full flex py-1 px-4 text-gray-600 text-sm">
      <button
        onClick={onToggleLike}
        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition ${
          reacted
            ? "text-green-600 hover:bg-green-50"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {reacted ? (
          <BiSolidLike size={18} className="text-green-600" />
        ) : (
          <BiLike size={18} className="text-gray-500" />
        )}
        <span className="text-sm font-medium">{t("like")}</span>
      </button>

      <button
        onClick={onComment}
        className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition"
      >
        <FaRegComment size={16} /> {t("comment")}
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
        <FaShare size={16} /> {t("share")}
      </button>
    </div>
  );
}
