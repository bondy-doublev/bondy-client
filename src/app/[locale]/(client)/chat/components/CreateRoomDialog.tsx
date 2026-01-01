"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Search, Users, MessageCircle, User, Check } from "lucide-react";
import { useTranslations } from "use-intl";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { resolveFileUrl } from "@/utils/fileUrl";

interface Friend {
  id: string;
  fullName?: string;
  username?: string;
  avatarUrl?: string;
}

interface CreateRoomDialogProps {
  friends: Friend[];
  selectedFriends: string[];
  onClose: () => void;
  onSelectFriend: (id: string, checked: boolean) => void;
  onCreate: (arg?: string | string[]) => void;
  tab: "personal" | "group";
}

export const CreateRoomDialog: React.FC<CreateRoomDialogProps> = ({
  friends,
  selectedFriends,
  onClose,
  onSelectFriend,
  onCreate,
  tab,
}) => {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [privateRoomFriendIds, setPrivateRoomFriendIds] = useState<string[]>(
    []
  );
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();
  const t = useTranslations("chat");

  // Fetch existing private rooms
  const handleGetConversations = async () => {
    if (!user) return;
    try {
      const res = await chatService.getPrivateRooms(user.id);
      const friendIds = res.map((room: any) => room.members[0].id.toString());
      setPrivateRoomFriendIds(friendIds);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  useEffect(() => {
    handleGetConversations();
  }, [user]);

  // Filter friends based on tab and search
  const filteredFriends = useMemo(() => {
    let filtered = friends;

    // For personal chat, exclude friends who already have a room
    if (tab === "personal") {
      filtered = friends.filter(
        (f) => !privateRoomFriendIds.includes(f.id.toString())
      );
    }

    // Apply search filter
    const keyword = searchQuery.trim().toLowerCase();
    if (keyword) {
      filtered = filtered.filter((f) => {
        const name = (f.fullName || f.username || "").toLowerCase();
        return name.includes(keyword);
      });
    }

    return filtered;
  }, [friends, searchQuery, tab, privateRoomFriendIds]);

  // Reset visible count when search/tab changes
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery, tab]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (isNearBottom && visibleCount < filteredFriends.length) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredFriends.length));
    }
  };

  const handleCreate = () => {
    if (tab === "personal") {
      if (selectedFriends.length === 1) {
        onCreate(selectedFriends[0]);
      }
    } else {
      if (groupName.trim() && selectedFriends.length >= 2) {
        onCreate(groupName.trim());
      }
    }
  };

  // For personal chat, create room immediately on click
  const handleClickFriend = (id: string) => {
    if (tab === "personal") {
      onCreate(id);
    }
  };

  const canCreate = useMemo(() => {
    if (tab === "personal") return selectedFriends.length === 1;
    return groupName.trim().length > 0 && selectedFriends.length >= 2;
  }, [tab, groupName, selectedFriends]);

  const handleReset = () => {
    setGroupName("");
    setSearchQuery("");
    setVisibleCount(20);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent className="w-[95%] md:max-w-xl bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70] max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="flex items-center justify-center h-14 border-b bg-gradient-to-r from-green-50 to-white z-10 relative shrink-0">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none flex items-center gap-2">
            {tab === "personal" ? (
              <>
                <MessageCircle className="w-4 h-4 text-green-600" />
                {t("newChat")}
              </>
            ) : (
              <>
                <Users className="w-4 h-4 text-green-600" />
                {t("newGroup")}
              </>
            )}
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
              aria-label="Close"
              onClick={handleClose}
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scroll-custom">
          {/* Group Name Input (only for group) */}
          {tab === "group" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Users className="w-4 h-4 text-green-600" />
                {t("groupName")}
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder={t("enterGroupName")}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={50}
              />
              <p className="text-xs text-gray-500">
                {groupName.length}/50 {t("characters")}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              {tab === "personal" ? (
                <>
                  <strong>{t("instruction")}:</strong> {t("clickToStartChat")}
                </>
              ) : (
                <>
                  <strong>{t("instruction")}:</strong>{" "}
                  {t("selectAtLeastTwoFriends")}
                </>
              )}
            </p>
          </div>

          {/* Selected Count (only for group) */}
          {tab === "group" && selectedFriends.length > 0 && (
            <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">
                {t("selected")}: {selectedFriends.length}
              </span>
              <button
                onClick={() =>
                  selectedFriends.forEach((id) => onSelectFriend(id, false))
                }
                className="text-xs text-green-600 hover: text-green-800 font-medium underline"
              >
                {t("clearAll")}
              </button>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchFriends")}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Friends List */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4 text-green-600" />
                {tab === "personal"
                  ? t("availableFriends")
                  : t("selectFriends")}
              </span>
              <span className="text-xs text-gray-500">
                {filteredFriends.length} {t("friendsAvailable")}
              </span>
            </label>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="max-h-[280px] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 scroll-custom bg-white"
            >
              {filteredFriends.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-1">
                    {searchQuery
                      ? t("noFriendsFound")
                      : tab === "personal"
                      ? t("noFriendsToChat")
                      : t("noFriendsAvailable")}
                  </p>
                  {tab === "personal" && !searchQuery && (
                    <p className="text-xs text-gray-400">
                      {t("allFriendsHaveRooms")}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {filteredFriends.slice(0, visibleCount).map((f) => {
                    const isSelected = selectedFriends.includes(f.id);
                    const displayName =
                      f.fullName || f.username || t("unknown");
                    const fallbackLetter = displayName[0]?.toUpperCase() || "?";

                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          if (tab === "personal") {
                            handleClickFriend(f.id);
                          } else {
                            onSelectFriend(f.id, !isSelected);
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                          tab === "group" && isSelected
                            ? "bg-green-50 hover:bg-green-100"
                            : "hover: bg-gray-50"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          {f.avatarUrl ? (
                            <img
                              src={resolveFileUrl(f.avatarUrl)}
                              alt={displayName}
                              className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                              {fallbackLetter}
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {displayName}
                          </div>
                          {f.username && f.fullName && (
                            <div className="text-xs text-gray-500 truncate">
                              @{f.username}
                            </div>
                          )}
                        </div>

                        {/* Checkbox (group) or Arrow (personal) */}
                        {tab === "group" ? (
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                              isSelected
                                ? "bg-green-600 border-green-600"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <Check
                                className="w-3. 5 h-3.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}

                  {/* Loading More Indicator */}
                  {visibleCount < filteredFriends.length && (
                    <div className="p-3 text-center bg-gray-50">
                      <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        {t("loadingMore")}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer (only show for group) */}
        {tab === "group" && (
          <div className="px-4 pb-4 pt-2 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-4 text-sm"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canCreate}
              className={`px-6 text-sm font-medium ${
                canCreate
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {t("createGroup")}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
