"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { userService } from "@/services/userService";
import { useTranslations } from "use-intl";
import { Search, Plus, Users, MessageCircle } from "lucide-react";

interface SidebarProps {
  tab: "personal" | "group";
  setTab: (t: "personal" | "group") => void;
  conversations: any[];
  selectedRoomId: string | null;
  onSelectRoom: (room: any) => void;
  onOpenDialog: () => void;
  currentUserId?:  number;
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
  const [senderNames, setSenderNames] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("chat");

  useEffect(() => {
    const idsToFetch = conversations
      .map((r) => r.latestUnreadMessage?.senderId)
      .filter((id): id is string => !!id && id !== String(currentUserId));

    idsToFetch.forEach((id) => {
      if (! senderNames[id]) {
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

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((r) => {
      const name = (tab === "personal" ? r.displayName : r.name) || "";
      return name.toLowerCase().includes(keyword);
    });
  }, [conversations, searchQuery, tab]);

  // Reset visible count when search/tab changes
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, tab]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isNearBottom && visibleCount < filteredConversations.length) {
      setVisibleCount((prev) =>
        Math.min(prev + 20, filteredConversations.length)
      );
    }
  };

  return (
    <div
      className={`w-full md:w-[400px] border-r border-gray-200 bg-white flex flex-col ${
        className || ""
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-green-50 to-white shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            {t("messages")}
          </h2>
          <Button
            onClick={onOpenDialog}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full w-9 h-9 p-0 flex items-center justify-center shadow-md"
            title={tab === "personal" ? t("newChat") : t("newGroup")}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Tab Switch */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "personal" | "group")}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 p-1 rounded-full h-9">
            <TabsTrigger
              value="personal"
              className="rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
            >
              <MessageCircle className="w-3. 5 h-3.5 mr-1.5" />
              {t("personal")}
            </TabsTrigger>
            <TabsTrigger
              value="group"
              className="rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm"
            >
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {t("group")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search Bar */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchConversations")}
            className="w-full pl-10 pr-3 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-custom"
      >
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              {searchQuery ? (
                <Search className="w-8 h-8 text-gray-400" />
              ) : (
                <MessageCircle className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {searchQuery ? t("noConversationsFound") : t("noConversations")}
            </p>
            {! searchQuery && (
              <Button
                onClick={onOpenDialog}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                {tab === "personal" ? t("startNewChat") : t("createNewGroup")}
              </Button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredConversations.slice(0, visibleCount).map((r, index) => {
              const latest = r.latestUnreadMessage;
              const isMine = latest?.senderId === String(currentUserId);
              const senderLabel = isMine
                ? t("you")
                : latest
                ? senderNames[latest.senderId] || t("someoneElse")
                : "";
              const content = latest?.content || "";
              const isUnread = latest?. isUnread && ! isMine;
              const avatarUrl =
                tab === "personal" ? r.avatarUrl : r.avatar || null;
              const displayName = tab === "personal" ? r.displayName : r.name;
              const fallbackLetter = displayName?.[0]?.toUpperCase() || "? ";

              return (
                <li key={r.id || index}>
                  <button
                    onClick={() => onSelectRoom(r)}
                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors relative ${
                      selectedRoomId === r.id
                        ?  "bg-green-50 border-l-4 border-green-600"
                        : "hover: bg-gray-50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt="avatar"
                          width={48}
                          height={48}
                          className="rounded-full object-cover ring-2 ring-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {fallbackLetter}
                        </div>
                      )}
                      {isUnread && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-left min-w-0">
                      <div
                        className={`font-semibold text-sm truncate ${
                          isUnread ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {displayName}
                      </div>
                      {latest ?  (
                        <div
                          className={`text-xs truncate mt-0.5 ${
                            isUnread
                              ? "font-semibold text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {senderLabel && (
                            <span className="font-medium">{senderLabel}:  </span>
                          )}
                          {content. length > 0 ? content : t("attachment")}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic mt-0.5">
                          {t("noMessages")}
                        </div>
                      )}
                      {latest?. createdAt && (
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {new Date(latest.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute:  "2-digit",
                          })}
                        </div>
                      )}
                    </div>

                    {/* Unread Badge */}
                    {isUnread && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Loading more indicator */}
        {visibleCount < filteredConversations.length && (
          <div className="p-3 text-center">
            <div className="inline-flex items-center gap-2 text-xs text-gray-500">
              <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              {t("loadingMore")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};