import { FaHeart, FaRegComment, FaShare } from "react-icons/fa";

export default function PostActions({ t }: { t: (key: string) => string }) {
  return (
    <div className="w-full flex py-1 px-4 text-gray-600 text-sm">
      <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
        <FaHeart /> {t("like")}
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
        <FaRegComment /> {t("comment")}
      </button>
      <button className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-md hover:bg-gray-100 transition">
        <FaShare /> {t("share")}
      </button>
    </div>
  );
}
