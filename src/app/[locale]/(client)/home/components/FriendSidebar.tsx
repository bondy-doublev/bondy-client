import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import { useTranslations } from "next-intl";
import React from "react";

export default function FriendSidebar() {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = user?.id ?? 0;

  const { friendUsers } = useMyFriends(currentUserId);

  return (
    <aside className="hidden xl:block w-80 bg-white rounded-xl shadow p-4 space-y-4 h-fit">
      <h2 className="font-semibold text-gray-700">{t("contacts")}</h2>
      <ul className="space-y-3">
        {friendUsers.map((friend) => (
          <li
            key={friend.id}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="relative">
              {user?.avatarUrl ? (
                <UserAvatar avatarUrl={user.avatarUrl} />
              ) : (
                <DefaultAvatar firstName={user?.firstName} />
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <p className="text-sm font-medium">{friend.fullName}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
