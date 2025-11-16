"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { userService } from "@/services/userService";
import { useTranslations } from "use-intl";

interface SidebarProps {
  tab: "personal" | "group";
  setTab: (t: "personal" | "group") => void;
  conversations: any[];
  selectedRoomId: string | null;
  onSelectRoom: (room: any) => void;
  onOpenDialog: () => void;
  currentUserId?: number;
}

export const Sidebar: React.FC<SidebarProps & { className?: string }> = ({
  className,
  tab,
  setTab,
  conversations,
  selectedRoomId,
  onSelectRoom,
  onOpenDialog,
  currentUserId,
}) => {
  // cache tên senderId → senderName
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});
  const t = useTranslations("chat");

  useEffect(() => {
    // lấy tất cả senderId cần fetch
    const idsToFetch = conversations
      .map((r) => r.latestUnreadMessage?.senderId)
      .filter((id): id is string => !!id && id !== String(currentUserId));

    idsToFetch.forEach((id) => {
      if (!senderNames[id]) {
        userService
          .getBasicProfile(Number(id))
          .then((profile) => {
            setSenderNames((prev) => ({
              ...prev,
              [id]:
                profile.data.id == currentUserId
                  ? t("you")
                  : profile.data.fullName ||
                    profile.data.username ||
                    t("someoneElse"),
            }));
          })
          .catch(() => {
            setSenderNames((prev) => ({ ...prev, [id]: t("someoneElse") }));
          });
      }
    });
  }, [conversations, currentUserId]);

  return (
    <div
      className={`w-80 md:w-[400px] border-r border-gray-200 p-4 flex flex-col md:flex-row ${
        className || ""
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="personal">{t("personal")}</TabsTrigger>
            <TabsTrigger value="group">{t("group")}</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          className="
            mt-2 md:mt-0 
            text-sm
            md:bg-transparent md:text-blue-600 
            md:hover:bg-transparent md:hover:underline
            md:mx-0
            md:px-0
          "
          onClick={onOpenDialog}
        >
          {tab === "personal" ? t("newChat") : t("newGroup")}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <ul className="space-y-2">
          {conversations.map((r, index) => {
            const latest = r.latestUnreadMessage;
            const isMine = latest?.senderId === String(currentUserId);

            const senderLabel = isMine
              ? t("you")
              : latest
              ? senderNames[latest.senderId] || t("someoneElse")
              : "";

            const content = latest?.content || "";
            const isUnread = latest?.isUnread && !isMine;

            const avatarUrl =
              tab === "personal" ? r.avatarUrl : r.avatar || null;
            const fallbackLetter =
              (tab === "personal"
                ? r.displayName
                : r.name)?.[0]?.toUpperCase() || "?";

            return (
              <li key={index}>
                <button
                  onClick={() => onSelectRoom(r)}
                  className={`w-full flex items-center gap-3 px-2 py-2 rounded hover:bg-gray-100 transition ${
                    selectedRoomId === r.id ? "bg-gray-200" : ""
                  }`}
                >
                  {/* Avatar */}
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="avatar"
                      width={40}
                      height={40}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                      {fallbackLetter}
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 text-left">
                    <div className="font-medium truncate">
                      {tab === "personal" ? r.displayName : r.name}
                    </div>
                    {latest && (
                      <div
                        className={`text-sm truncate ${
                          isUnread
                            ? "font-semibold text-black"
                            : "text-gray-600"
                        }`}
                      >
                        {senderLabel}:{" "}
                        {content.length > 0 ? content : "[Đính kèm]"}
                      </div>
                    )}
                    {!latest && (
                      <div className="text-sm text-gray-400 italic">
                        {t("noMessages")}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
};
