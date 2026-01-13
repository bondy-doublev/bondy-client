"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import User, { mapUserToUserBasic, UserBasic } from "@/models/User";
import { useAuthStore } from "@/store/authStore";
import { X } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";

export default function TagModal({
  t,
  showModal,
  onClose,
  onSetTagUsers,
  initialTagged = [],
}: {
  t: (key: string) => string;
  showModal: boolean;
  onClose: () => void;
  onSetTagUsers: (users: UserBasic[]) => void;
  initialTagged?: UserBasic[];
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { user } = useAuthStore();
  const { loading, friendUsers } = useMyFriends(user?.id ?? 0, {
    getAll: true,
    enabled: showModal,
  });

  // Khởi tạo selectedIds khi modal mở
  const prevOpenRef = useRef<boolean>(false);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = showModal;

    if (!wasOpen && showModal) {
      const ids = (initialTagged ?? []).map((u) => u.id);
      setSelectedIds(ids);
    }
  }, [showModal, initialTagged]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return friendUsers;
    return friendUsers.filter((u) =>
      (u.fullName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friendUsers, searchTerm]);

  const selectedUsers = useMemo(() => {
    if (!friendUsers?.length || !selectedIds.length) return [];
    const selectedSet = new Set(selectedIds);
    return friendUsers.filter((u) => selectedSet.has(u.id));
  }, [friendUsers, selectedIds]);

  // Sync ra ngoài mỗi khi selectedIds thay đổi (như cũ)
  const firstSyncRef = useRef(true);
  useEffect(() => {
    if (firstSyncRef.current) {
      firstSyncRef.current = false;
      return;
    }
    const basics = selectedUsers.map((u) => mapUserToUserBasic(u));
    onSetTagUsers(basics);
  }, [selectedIds]);

  const handleSelectUser = (user: User) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(user.id);
      return exists ? prev.filter((id) => id !== user.id) : [...prev, user.id];
    });
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedIds((prev) => prev.filter((id) => id !== userId));
  };

  // === FIX CHÍNH: Sync và đóng khi bấm Done ===
  const handleDone = () => {
    // Luôn sync state hiện tại ra cha (kể cả không thay đổi)
    const currentBasics = selectedUsers.map((u) => mapUserToUserBasic(u));
    onSetTagUsers(currentBasics);
    onClose();
  };

  return (
    <Dialog open={showModal}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />

      <DialogContent
        className="
          w-[90%] md:max-w-2xl 
          bg-white rounded-2xl shadow-xl
          p-0 flex flex-col overflow-hidden
          data-[state=open]:animate-none
          z-[70]
          max-h-[90vh]
        "
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()} // ngăn ESC đóng bất ngờ
      >
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10 relative">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("headerTagsModal")}
          </DialogTitle>

          <button
            onClick={handleDone} // ← Dùng hàm này thay vì onClose trực tiếp
            className="absolute right-4 px-4 py-2 rounded-md hover:bg-gray-100 transition text-green-600 hover:text-green-800 font-medium"
            aria-label="Done"
          >
            {t("done")}
          </button>
        </DialogHeader>

        {/* Danh sách đã chọn (chips) */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-3 border-b">
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

        <div className="p-4 border-b">
          <input
            type="text"
            placeholder={t("searchFriends")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="p-4 text-gray-600 flex-1 overflow-hidden">
          {loading ? (
            <p className="text-center text-sm text-gray-500">
              {t("loading")}...
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              {t("noFriends")}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[calc(60vh-120px)] overflow-y-auto scroll-custom">
              {filteredUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition border ${
                      isSelected
                        ? "bg-green-50 border-green-400"
                        : "hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {user.avatarUrl ? (
                        <UserAvatar
                          userId={user.id}
                          avatarUrl={user.avatarUrl}
                        />
                      ) : (
                        <DefaultAvatar
                          userId={user.id}
                          firstName={user.fullName}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">
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
