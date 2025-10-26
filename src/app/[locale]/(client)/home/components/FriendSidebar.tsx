import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import React from "react";

export default function FriendSidebar({
  className,
  userId,
}: {
  className?: string;
  userId?: number;
}) {
  const t = useTranslations("friend");
  const router = useRouter();

  const { user } = useAuthStore();
  const currentUserId = userId ?? user?.id ?? 0;

  const { friendUsers } = useMyFriends(currentUserId);

  const isNewFeed = !userId;

  return (
    <aside
      className={`hidden xl:block w-80 bg-white rounded-xl shadow p-4 pt-2 space-y-2 h-fit ${className}`}
    >
      {/* 🧱 Tiêu đề khác nhau */}
      <div className="flex justify-between">
        <h2 className="font-semibold text-gray-700 py-2">
          {isNewFeed ? t("contacts") : t("friends")}
        </h2>

        {!isNewFeed && friendUsers.length > 0 && (
          <div className="text-center">
            <button className="text-green-600 hover:bg-green-100 p-2 rounded-md text-sm font-medium">
              {t("seeAllFriends")}
            </button>
          </div>
        )}
      </div>

      {/* 🧩 Nếu đang xem tường người khác, hiển thị giống “Friends” trên profile */}
      {friendUsers.length > 0 ? (
        <ul className={`grid ${isNewFeed ? "space-y-3" : "grid-cols-3 gap-3"}`}>
          {friendUsers.slice(0, isNewFeed ? 10 : 9).map((friend) => (
            <li
              key={friend.id}
              onClick={() => router.push("/wall/" + friend.id)}
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
                  isNewFeed ? "" : "mt-1 truncate max-w-[5rem]"
                } text-gray-700`}
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
    </aside>
  );
}
