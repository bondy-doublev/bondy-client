"use client";

import React, { useState, useEffect, useRef } from "react";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { formatTime } from "@/utils/format";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import { UserBasic } from "@/models/User";
import TaggedModal from "@/app/[locale]/(client)/home/components/post/TaggedModal";
import { Globe, Lock } from "lucide-react"; // ✅ THÊM

export default function PostHeader({
  t,
  owner,
  seconds,
  taggedUsers = [],
  isOwner = false,
  onEdit,
  onDelete,
  isSharePost,
  isPublic, // đã có
}: {
  t: (key: string) => string;
  owner: UserBasic;
  seconds: number;
  taggedUsers?: UserBasic[];
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isSharePost?: boolean;
  isPublic: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const renderTaggedText = () => {
    if (!taggedUsers || taggedUsers.length === 0) return null;
    const first = taggedUsers[0];
    const others = taggedUsers.slice(1);

    if (taggedUsers.length === 1) {
      return (
        <>
          {" "}
          <div className="mr-1">{t("with")} </div>
          <UserName
            userId={first.id}
            fullname={first.fullName}
            className="font-semibold"
          />
        </>
      );
    }

    return (
      <>
        {" "}
        <div className="mr-1">{t("with")} </div>
        <UserName
          className="font-semibold mr-1"
          userId={first.id}
          fullname={first.fullName}
        />{" "}
        <div className="mr-1">{t("and")} </div>
        <span
          onClick={() => setIsModalOpen(true)}
          className="flex gap-1 font-semibold hover:underline cursor-pointer"
        >
          {others.length === 1 ? (
            <UserName userId={others[0].id} fullname={others[0].fullName} />
          ) : (
            `${others.length} ${t("others")}`
          )}
        </span>
      </>
    );
  };

  return (
    <div className="flex items-center p-4 pb-0 gap-3 relative">
      {owner.avatarUrl ? (
        <UserAvatar userId={owner.id} avatarUrl={owner.avatarUrl} />
      ) : (
        <DefaultAvatar userId={owner.id} firstName={owner.fullName} />
      )}

      <div className="flex flex-col gap-0 flex-1">
        <div className="flex flex-wrap leading-tight">
          <span className="font-semibold mr-1">
            <UserName userId={owner.id} fullname={owner.fullName} />
          </span>
          {renderTaggedText()}
        </div>

        <div className="text-xs text-gray-500 flex items-center gap-1">
          <span className="hover:underline cursor-pointer">
            {formatTime(seconds, t)} {t("ago")}
          </span>

          <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />

          <span className="inline-flex items-center gap-1">
            {isPublic ? (
              <>
                <Globe size={12} />
              </>
            ) : (
              <>
                <Lock size={12} />
              </>
            )}
          </span>
        </div>
      </div>

      {isOwner && !isSharePost && (
        <div className="relative mb-2" ref={menuRef}>
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
