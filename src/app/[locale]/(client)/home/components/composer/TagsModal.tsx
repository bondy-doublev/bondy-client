"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Friendship } from "@/models/Friendship";
import { friendService } from "@/services/friendService";
import { X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

export default function TagsModal({
  t,
  currentUserId,
  showModal,
  onClose,
  onSetTagUserIds,
}: {
  t: (key: string) => string;
  currentUserId?: number;
  showModal: boolean;
  onClose: () => void;
  onSetTagUserIds: (ids: number[]) => void;
}) {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

  const fetchFriends = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const res: Friendship[] = await friendService.getFriends(currentUserId);
      setFriends(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) fetchFriends();
  }, [currentUserId, showModal]);

  const friendUsers = useMemo(
    () =>
      friends.map((f) =>
        f.senderId === currentUserId ? f.receiverInfo : f.senderInfo
      ),
    [friends, currentUserId]
  );

  // ✅ Lọc theo searchTerm
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return friendUsers;
    return friendUsers.filter((u) =>
      u.fullName!.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friendUsers, searchTerm]);

  // ✅ Khi thay đổi selectedUsers => cập nhật danh sách ID ra ngoài
  useEffect(() => {
    const ids = selectedUsers.map((u) => u.id);
    onSetTagUserIds(ids);
  }, [selectedUsers, onSetTagUserIds]);

  // ✅ Chọn hoặc bỏ chọn user
  const handleSelectUser = (user: any) => {
    setSelectedUsers((prev) => {
      const exists = prev.find((u) => u.id === user.id);
      if (exists) return prev.filter((u) => u.id !== user.id);
      return [...prev, user];
    });
  };

  // ✅ Xóa khỏi danh sách đã chọn
  const handleRemoveUser = (userId: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />

      <DialogContent
        className="
          w-[90%] md:max-w-2xl 
          bg-white rounded-2xl shadow-xl
          p-0 flex flex-col overflow-hidden
          data-[state=open]:animate-none
          z-[70]
        "
      >
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("headerTagsModal")}
          </DialogTitle>

          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* ✅ Danh sách đã chọn */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 pt-3 border-b pb-3">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
              >
                <span className="text-sm font-medium text-gray-800">
                  {user.fullName}
                </span>
                <button
                  onClick={() => handleRemoveUser(user.id)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Ô search */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder={t("searchFriends")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* ✅ Danh sách bạn bè */}
        <div className="p-4 text-gray-600">
          {loading ? (
            <p className="text-center text-sm text-gray-500">
              {t("loading")}...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              {t("noFriends")}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto scroll-custom">
              {filteredUsers.map((user) => {
                const isSelected = selectedUsers.some((u) => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                      isSelected
                        ? "bg-green-100 border border-green-400"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {user.avatarUrl ? (
                        <UserAvatar avatarUrl={user.avatarUrl} />
                      ) : (
                        <DefaultAvatar firstName={user.fullName} />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isSelected ? t("selected") : t("tapToTag")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
