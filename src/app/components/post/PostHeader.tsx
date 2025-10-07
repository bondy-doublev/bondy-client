import React from "react";
import Image from "next/image";

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
      return `${seconds} ${t("second")}${seconds > 1 ? "s" : ""}`;
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${t("minute")}${minutes > 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${t("hour")}${hours > 1 ? "s" : ""}`;
    }
    const days = Math.floor(hours / 24);
    return `${days} ${t("day")}${days > 1 ? "s" : ""}`;
  };

  return (
    <div className="flex items-center p-4 pb-0 gap-3">
      <div className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:brightness-105 transition">
        <Image src={avatarUrl} alt="post" fill className="object-cover" />
      </div>
      <div>
        <p className="font-semibold hover:underline cursor-pointer">{name}</p>
        <span className="text-xs text-gray-500 hover:underline cursor-pointer">
          {formatTime(seconds)} {t("ago")}
        </span>
      </div>
    </div>
  );
}
