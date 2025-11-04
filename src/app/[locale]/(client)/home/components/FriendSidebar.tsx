import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import React from "react";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

export default function FriendSidebar({
  className,
  userId,
  onSeeAll,
  isDetail = false,
}: {
  className?: string;
  userId?: number;
  onSeeAll?: () => void;
  isDetail?: boolean;
}) {
  const t = useTranslations("friend");
  const router = useRouter();

  const { user } = useAuthStore();
  const currentUserId = userId ?? user?.id ?? 0;

  const { friendUsers } = useMyFriends(currentUserId);

  const isNewFeed = !userId;

  return (
    <aside
      className={`${
        isDetail ? "" : "hidden xl:block"
      } w-80 bg-white rounded-xl shadow p-4 pt-2 space-y-2 h-fit ${className}`}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700 py-2">
          {isNewFeed ? t("contacts") : t("friends")}
        </h2>

        {!isNewFeed && friendUsers.length > 0 && onSeeAll && !isDetail && (
          <button
            onClick={onSeeAll}
            className="text-green-600 hover:bg-green-100 p-2 rounded-md text-sm font-medium"
          >
            {t("seeAllFriends")}
          </button>
        )}
      </div>

      {friendUsers.length > 0 ? (
        <>
          {(() => {
            const visibleFriends =
              isDetail || isNewFeed ? friendUsers : friendUsers.slice(0, 9);

            return (
              <ul
                className={
                  isDetail
                    ? "grid grid-cols-2 gap-3"
                    : isNewFeed
                    ? "space-y-3"
                    : "grid grid-cols-3 gap-3"
                }
              >
                {visibleFriends.map((friend) => (
                  <li
                    key={friend.id}
                    className={`group cursor-pointer ${
                      isDetail
                        ? "flex items-center md:justify-between gap-0 md:gap-3 hover:bg-gray-50 p-2 rounded-lg shadow-2xs"
                        : isNewFeed
                        ? "flex items-center gap-3 hover:bg-gray-50 p-1 rounded-lg"
                        : "flex flex-col items-start"
                    }`}
                  >
                    <div
                      className={`flex ${
                        isDetail
                          ? "flex-col md:flex-row md:items-center gap-3 flex-1"
                          : !isNewFeed
                          ? "flex-col"
                          : "items-center gap-2"
                      }`}
                    >
                      <div className="relative">
                        {friend?.avatarUrl ? (
                          <UserAvatar
                            userId={friend.id}
                            avatarUrl={friend.avatarUrl}
                            className={
                              isNewFeed ? "w-10 h-10" : "w-24 h-24 rounded-lg"
                            }
                          />
                        ) : (
                          <DefaultAvatar
                            userId={friend.id}
                            firstName={friend?.fullName}
                            className={
                              isNewFeed ? "w-10 h-10" : "w-24 h-24 rounded-lg"
                            }
                          />
                        )}
                        {isNewFeed && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <p
                        className={`text-sm font-medium text-gray-700 hover:underline hover:text-green-600 ${
                          isNewFeed
                            ? ""
                            : isDetail
                            ? "truncate"
                            : "mt-1 truncate max-w-[5rem]"
                        }`}
                        title={friend.fullName}
                      >
                        <UserName
                          userId={friend.id}
                          fullname={friend.fullName ?? ""}
                          className="font"
                        />
                      </p>
                    </div>

                    {isDetail && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="p-1 rounded-full hover:bg-gray-200"
                      >
                        <MoreHorizontal size={18} className="text-gray-600" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            );
          })()}
        </>
      ) : (
        <p className="text-sm text-gray-500">{t("noFriends")}</p>
      )}
    </aside>
  );
}
