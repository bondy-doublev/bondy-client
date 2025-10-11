import { FaHeart, FaRegComment, FaShare } from "react-icons/fa";
import { BiLike } from "react-icons/bi";

export default function PostActions({
  t,
  onComment,
}: {
  t: (key: string) => string;
  onComment?: () => void;
}) {
  return (
    <div className="w-full flex py-1 px-4 text-gray-600 text-sm">
      <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
        <BiLike size={16} /> {t("like")}
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
