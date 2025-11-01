"use client";

import React, { useState, useEffect } from "react";
import { FiMessageSquare } from "react-icons/fi";
import { friendService } from "@/services/friendService";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DefaultAvatar from "./user/DefaultAvatar";

export default function CreateChatButton() {
  const [friends, setFriends] = useState<any[]>([]);
  const { user } = useAuthStore();
  const router = useRouter();

  // Load danh sách bạn khi mở dialog
  const loadFriends = async () => {
    if (!user?.id) return;
    try {
      const res = await friendService.getFriends(user.id);
      setFriends(res);
    } catch (err) {
      console.error("Failed to load friends", err);
    }
  };

  const handleSelectFriend = (friend: any) => {
    router.push(`/chat/${friend.id}`);
  };

  return (
    <Dialog onOpenChange={(open) => open && loadFriends()}>
      <DialogTrigger asChild>
        <div className="fixed bottom-6 right-6 flex items-center group z-20 cursor-pointer">
          <span className="opacity-0 group-hover:opacity-100 mr-2 bg-green-600 text-white px-3 py-1 rounded-lg transition-opacity duration-300">
            Bắt đầu trò chuyện
          </span>
          <button className="w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors duration-300">
            <FiMessageSquare size={22} />
          </button>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[380px] rounded-2xl bg-white text-gray-800 border border-green-600 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-green-700">
            Chọn bạn để bắt đầu
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 max-h-[60vh] overflow-y-auto">
          {friends.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">Không có bạn nào</div>
          ) : (
            friends.map((f) => {
              const friend =
                f.senderId === user?.id ? f.receiverInfo : f.senderInfo;
              return (
                <div
                  key={friend.id}
                  onClick={() => handleSelectFriend(friend)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-green-50 rounded-lg transition-colors"
                >
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.fullName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <DefaultAvatar firstName={friend.fullName.split(" ")[0]} />
                  )}
                  <div className="text-gray-800">{friend.fullName}</div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
