"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { Search, X } from "lucide-react";
import { friendService } from "@/services/friendService";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import DefaultAvatar from "./user/DefaultAvatar";
import { resolveFileUrl } from "@/utils/fileUrl";

export default function CreateChatButton() {
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Filter friends based on search
  const filteredFriends = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return friends;

    return friends.filter((f) => {
      const friend = f.senderId === user?.id ? f.receiverInfo : f.senderInfo;
      return friend.fullName?.toLowerCase().includes(keyword);
    });
  }, [friends, searchQuery, user?.id]);

  // ✅ Reset visible count when search changes
  useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  // ✅ Load friends when dialog opens
  const loadFriends = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const res = await friendService.getFriends(user.id);
      setFriends(res);
    } catch (err) {
      console.error("Failed to load friends", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle friend selection
  const handleSelectFriend = async (friend: any) => {
    if (!user?.id) return;

    try {
      // 1. Get all private rooms
      const rooms = await chatService.getPrivateRooms(user.id);

      // 2. Find existing room with this friend
      const existingRoom = rooms.find((r: any) =>
        r.members?.some((m: any) => m.id === friend.id)
      );

      let roomId: string;

      if (existingRoom) {
        // Use existing room
        roomId = existingRoom.id;
        console.log("✅ Found existing room:", roomId);
      } else {
        // Create new room
        const newRoom = await chatService.createRoom("Chat cá nhân", false, [
          user.id,
          friend.id,
        ]);
        roomId = newRoom.id;
        console.log("✅ Created new room:", roomId);
      }

      // 3. Navigate to chat page with roomId
      const locale = pathname.split("/")[1] || "en";
      const chatUrl = `/${locale}/chat?  tab=personal&roomId=${roomId}`;

      console.log("🔗 Navigating to:", chatUrl);

      router.push(chatUrl);

      // 4. Close dialog
      setOpen(false);
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to open chat:", err);
    }
  };

  // ✅ Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isNearBottom && visibleCount < filteredFriends.length) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredFriends.length));
    }
  };

  // ✅ Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadFriends();
    } else {
      setSearchQuery("");
      setVisibleCount(20);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-6 flex items-center group z-20 cursor-pointer">
          <span className="opacity-0 group-hover:opacity-100 mr-2 bg-green-600 text-white px-3 py-1 rounded-lg transition-opacity duration-300 text-sm">
            Bắt đầu trò chuyện
          </span>
          <button className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors duration-300">
            <FiMessageSquare size={22} />
          </button>
        </div>
      </DialogTrigger>

      <DialogContent className="w-[95%] sm:max-w-[420px] rounded-2xl bg-white text-gray-800 shadow-xl p-0 overflow-hidden max-h-[85vh] flex flex-col">
        {/* ✅ Header */}
        <DialogHeader className="flex items-center justify-center h-14 border-b bg-white z-10 relative shrink-0">
          <DialogTitle className="text-base pt-2 font-semibold text-green-700 leading-none">
            Chọn bạn để bắt đầu trò chuyện
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* ✅ Search Bar */}
        <div className="p-4 border-b shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bạn bè..."
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover: text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* ✅ Friends List */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto scroll-custom"
        >
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Đang tải...</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Không tìm thấy bạn nào"
                  : "Bạn chưa có bạn bè nào"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredFriends.slice(0, visibleCount).map((f, index) => {
                const friend =
                  f.senderId === user?.id ? f.receiverInfo : f.senderInfo;

                return (
                  <button
                    key={friend.id || index}
                    onClick={() => handleSelectFriend(friend)}
                    className="w-full flex items-center gap-3 p-3 hover: bg-green-50 transition-colors text-left"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {friend.avatarUrl ? (
                        <img
                          src={resolveFileUrl(friend.avatarUrl)}
                          alt={friend.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <DefaultAvatar
                          userId={friend.id}
                          firstName={friend.fullName?.split(" ")[0] || "U"}
                        />
                      )}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {friend.fullName}
                      </div>
                      {friend.username && (
                        <div className="text-xs text-gray-500 truncate">
                          @{friend.username}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                );
              })}

              {/* ✅ Loading more indicator */}
              {visibleCount < filteredFriends.length && (
                <div className="p-3 text-center">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    Đang tải thêm...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ✅ Footer with count */}
        {!loading && filteredFriends.length > 0 && (
          <div className="px-4 py-2 border-t bg-gray-50 text-center text-xs text-gray-500 shrink-0">
            {searchQuery
              ? `Tìm thấy ${filteredFriends.length} bạn`
              : `Có ${filteredFriends.length} bạn bè`}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
