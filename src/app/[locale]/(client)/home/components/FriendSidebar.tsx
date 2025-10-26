import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import React from "react";

export default function FriendSidebar({
  className,
  userId,
}: {
  className?: string;
  userId?: number;
}) {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = userId ?? user?.id ?? 0;

  const { friendUsers } = useMyFriends(currentUserId);

  const isNewFeed = !userId;

  return (
    <aside
      className={`hidden xl:block w-80 bg-white rounded-xl shadow p-4 space-y-4 h-fit ${className}`}
    >
      {/* 🧱 Tiêu đề khác nhau */}
      <h2 className="font-semibold text-gray-700">
        {isNewFeed ? t("contacts") : t("friends")}
      </h2>

      {/* 🧩 Nếu đang xem tường người khác, hiển thị giống “Friends” trên profile */}
      {friendUsers.length > 0 ? (
        <ul className={`grid ${isNewFeed ? "space-y-3" : "grid-cols-3 gap-3"}`}>
          {friendUsers.slice(0, isNewFeed ? 10 : 9).map((friend) => (
            <li
              key={friend.id}
              className={`${
                isNewFeed
                  ? "flex items-center gap-3 cursor-pointer"
                  : "flex flex-col items-start cursor-pointer"
              }`}
            >
              <div className="relative">
                {friend?.avatarUrl ? (
                  <UserAvatar
                    avatarUrl={friend.avatarUrl}
                    className={isNewFeed ? "" : "w-24 h-24 rounded-lg"}
                  />
                ) : (
                  <DefaultAvatar
                    firstName={friend?.fullName}
                    className={isNewFeed ? "" : "w-24 h-24 rounded-lg"}
                  />
                )}
                {isNewFeed && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>

              <p
                className={`text-sm font-medium ${
                  isNewFeed ? "" : "mt-1"
                } text-gray-700 truncate max-w-[5rem]`}
                title={friend.fullName}
              >
                {friend.fullName}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">{t("noFriends")}</p>
      )}

      {!isNewFeed && (
        <div className="text-center">
          <button className="text-blue-600 hover:underline text-sm font-medium">
            {t("seeAllFriends")}
          </button>
        </div>
      )}
    </aside>
  );
}
