"use client";

import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { userService } from "@/services/userService";

interface SidebarProps {
  tab: "personal" | "group";
  setTab: (t: "personal" | "group") => void;
  conversations: any[];
  selectedRoomId: string | null;
  onSelectRoom: (room: any) => void;
  onOpenDialog: () => void;
  currentUserId?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
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
                  ? "Bạn"
                  : profile.data.fullName ||
                    profile.data.username ||
                    "Người khác",
            }));
          })
          .catch(() => {
            setSenderNames((prev) => ({ ...prev, [id]: "Người khác" }));
          });
      }
    });
  }, [conversations, currentUserId]);

  return (
    <div className="w-80 border-r border-gray-200 p-4 flex flex-col">
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="personal">Cá nhân</TabsTrigger>
          <TabsTrigger value="group">Nhóm</TabsTrigger>
        </TabsList>
      </Tabs>

      <Button className="mb-2" onClick={onOpenDialog}>
        {tab === "personal" ? "New Chat" : "New Group"}
      </Button>

      <ScrollArea className="flex-1">
        <ul className="space-y-2">
          {conversations.map((r, index) => {
            const latest = r.latestUnreadMessage;
            const isMine = latest?.senderId === String(currentUserId);

            const senderLabel = isMine
              ? "Tôi"
              : latest
              ? senderNames[latest.senderId] || "Người khác"
              : "";

            const content = latest?.content || "";
            const isUnread = latest?.isUnread && !isMine;

            const avatarUrl =
              tab === "personal" ? r.avatarUrl : r.avatarUrl || null;
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
                        Chưa có tin nhắn
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
