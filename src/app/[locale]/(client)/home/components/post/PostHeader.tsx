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
  taggedUsers = [],
}: {
  t: (key: string) => string;
  name: string;
  seconds: number;
  avatarUrl: string;
  taggedUsers?: { id: number; fullName: string }[];
}) {
  const renderTaggedText = () => {
    if (!taggedUsers || taggedUsers.length === 0) return null;

    const first = taggedUsers[0];
    const others = taggedUsers.slice(1);

    if (taggedUsers.length === 1) {
      return (
        <span className="text-gray-700">
          {" "}
          {t("with")}{" "}
          <span className="font-semibold hover:underline cursor-pointer">
            {first.fullName}
          </span>
        </span>
      );
    }

    return (
      <span className="text-gray-700">
        {" "}
        {t("with")}{" "}
        <span className="font-semibold hover:underline cursor-pointer">
          {first.fullName}
        </span>{" "}
        {t("and")}{" "}
        <span className="font-semibold hover:underline cursor-pointer">
          {others.length === 1
            ? others[0].fullName
            : `${others.length} ${t("others")}`}
        </span>
      </span>
    );
  };

  return (
    <div className="flex items-center p-4 pb-0 gap-3">
      {avatarUrl ? (
        <UserAvatar avatarUrl={avatarUrl} />
      ) : (
        <DefaultAvatar firstName={name} />
      )}

      <div className="flex flex-col gap-0">
        <div className="flex flex-wrap items-center gap-1 leading-tight">
          <span className="font-semibold text-gray-900">
            <UserName fullname={name} />
          </span>
          {renderTaggedText()}
        </div>

        <span className="text-xs text-gray-500 hover:underline cursor-pointer">
          {formatTime(seconds, t)} {t("ago")}
        </span>
      </div>
    </div>
  );
}
