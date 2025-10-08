import { useTranslations } from "next-intl";
import React from "react";
import { FiEdit2 } from "react-icons/fi";

export default function CreatePostButton() {
  const t = useTranslations("post");

  return (
    <div className="fixed bottom-6 right-6 flex items-center group">
      <span className="opacity-0 group-hover:opacity-100 mr-2 bg-green-600 text-white px-3 py-1 rounded-lg transition-opacity duration-300">
        {t("createNewPost")}
      </span>
      <button className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors duration-300">
        <FiEdit2 size={22} />
      </button>
    </div>
  );
}
