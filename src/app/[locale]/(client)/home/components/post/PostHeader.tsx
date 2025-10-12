import React from "react";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { formatTime } from "@/utils/format";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

export default function PostHeader({
  t,
  name,
  seconds,
  avatarUrl,
}: {
  t: (key: string) => string;
  name: string;
  seconds: number;
  avatarUrl: string;
}) {
  return (
    <div className="flex items-center p-4 pb-0 gap-3">
      {avatarUrl ? (
        <UserAvatar avatarUrl={avatarUrl} />
      ) : (
        <DefaultAvatar firstName={name} />
      )}
      <div className="flex flex-col gap-0">
        <UserName fullname={name} />
        <span className="text-xs text-gray-500 hover:underline cursor-pointer">
          {formatTime(seconds, t)} {t("ago")}
        </span>
      </div>
    </div>
  );
}
