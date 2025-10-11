import RoundedAvatar from "@/app/[locale]/(client)/home/components/center-content/RoundedAvatar";
import { useTranslations } from "next-intl";
import React from "react";
import { FaVideo } from "react-icons/fa";
import { BiSolidImage } from "react-icons/bi";
import { useAuthStore } from "@/store/authStore";
import DefaultAvatar from "@/app/layout/default/DefaultAvatar";

export default function PostComposer() {
  const t = useTranslations("post");

  const { user } = useAuthStore();

  const placeholder = user?.firstName + ", " + t("message");

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="flex items-center gap-3 p-4">
        {user?.avatarUrl ? (
          <RoundedAvatar avatarUrl={user?.avatarUrl} />
        ) : (
          <DefaultAvatar firstName={user?.firstName} />
        )}

        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
        />
      </div>
      <div className="flex justify-around border-t p-2 text-gray-600 text-sm">
        <button className="flex justify-center w-full items-center gap-2 py-1  rounded-md hover:bg-gray-100 transition">
          <BiSolidImage size={16} /> {t("image")}
        </button>
        <button className="flex justify-center w-full items-center gap-2 py-1 rounded-md hover:bg-gray-100 transition">
          <FaVideo size={16} /> {t("video")}
        </button>
      </div>
    </div>
  );
}
