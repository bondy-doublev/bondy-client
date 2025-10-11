import React from "react";
import RoundedAvatar from "@/app/[locale]/(client)/home/components/center-content/RoundedAvatar";
import DefaultAvatar from "@/app/layout/default/DefaultAvatar";
import { formatTime } from "@/utils/format";

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
        <RoundedAvatar avatarUrl={avatarUrl} />
      ) : (
        <DefaultAvatar firstName={name} />
      )}
      <div className="flex flex-col gap-0">
        <p className="font-semibold hover:underline cursor-pointer">{name}</p>
        <span className="text-xs text-gray-500 hover:underline cursor-pointer">
          {formatTime(seconds, t)} {t("ago")}
        </span>
      </div>
    </div>
  );
}
