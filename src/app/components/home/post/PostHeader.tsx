import React from "react";
import RoundedAvatar from "@/app/components/home/center-content/RoundedAvatar";
import DefaultAvatar from "@/app/layout/default/DefaultAvatar";

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
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} ${seconds > 1 ? t("seconds") : t("second")}`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes > 1 ? t("minutes") : t("minute")}`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours > 1 ? t("hours") : t("hour")}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} ${days > 1 ? t("days") : t("day")}`;
  };

  return (
    <div className="flex items-center p-4 pb-0 gap-3">
      {avatarUrl ? (
        <RoundedAvatar avatarUrl={avatarUrl} />
      ) : (
        <DefaultAvatar firstName={name} />
      )}
      <div>
        <p className="font-semibold hover:underline cursor-pointer">{name}</p>
        <span className="text-xs text-gray-500 hover:underline cursor-pointer">
          {formatTime(seconds)} {t("ago")}
        </span>
      </div>
    </div>
  );
}
