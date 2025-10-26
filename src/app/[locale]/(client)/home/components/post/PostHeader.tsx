import React, { useState } from "react";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { formatTime } from "@/utils/format";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import { UserBasic } from "@/models/User";
import TaggedModal from "@/app/[locale]/(client)/home/components/post/TaggedModal";

export default function PostHeader({
  t,
  owner,
  seconds,
  taggedUsers = [],
  isOwner = false,
  onEdit,
  onDelete,
}: {
  t: (key: string) => string;
  owner: UserBasic;
  seconds: number;
  taggedUsers?: UserBasic[];
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderTaggedText = () => {
    if (!taggedUsers || taggedUsers.length === 0) return null;

    const first = taggedUsers[0];
    const others = taggedUsers.slice(1);

    if (taggedUsers.length === 1) {
      return (
        <span className="text-gray-700 flex gap-1">
          {" "}
          {t("with")} <UserName userId={first.id} fullname={first.fullName} />
        </span>
      );
    }

    return (
      <span className="text-gray-700 flex gap-1">
        {" "}
        {t("with")}{" "}
        <UserName
          className="max-w-[100px] truncate sm:max-w-none sm:whitespace-normal sm:overflow-visible sm:text-ellipsis-none"
          userId={first.id}
          fullname={first.fullName}
        />{" "}
        {t("and")}{" "}
        <span
          onClick={() => setIsModalOpen(true)}
          className="flex gap-1 font-semibold hover:underline cursor-pointer"
        >
          {others.length === 1
            ? others[0].fullName
            : `${others.length} ${t("others")}`}
        </span>
      </span>
    );
  };

  return (
    <div className="flex items-center p-4 pb-0 gap-3 relative">
      {owner.avatarUrl ? (
        <UserAvatar avatarUrl={owner.avatarUrl} />
      ) : (
        <DefaultAvatar firstName={owner.fullName} />
      )}

      <div className="flex flex-col gap-0 flex-1">
        <div className="flex flex-wrap items-center gap-1 leading-tight">
          <span className="font-semibold text-gray-900">
            <UserName userId={owner.id} fullname={owner.fullName} />
          </span>
          {renderTaggedText()}
        </div>

        <span className="text-xs text-gray-500 hover:underline cursor-pointer">
          {formatTime(seconds, t)} {t("ago")}
        </span>
      </div>

      {isOwner && (
        <div className="relative mb-2">
          <button
            className="w-8 h-8 rounded-full hover:bg-gray-100"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            ⋯
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-md text-sm z-10">
              <button
                className="w-full px-4 py-2 hover:bg-gray-100 text-left"
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit?.();
                }}
              >
                {t("edit")}
              </button>
              <button
                className="w-full px-4 py-2 hover:bg-gray-100 text-left text-red-500"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete?.();
                }}
              >
                {t("delete")}
              </button>
            </div>
          )}
        </div>
      )}

      <TaggedModal
        t={t}
        showModal={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={taggedUsers}
      />
    </div>
  );
}
