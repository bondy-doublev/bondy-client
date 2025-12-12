"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import {
  Dialog,
  DialogClose,
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
  initialTagged = [], // ✅ THÊM: danh sách đã tag sẵn
}: {
  t: (key: string) => string;
  showModal: boolean;
  onClose: () => void;
  onSetTagUsers: (users: UserBasic[]) => void;
  initialTagged?: UserBasic[]; // ✅ THÊM
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Dùng ID để quản lý lựa chọn, tránh lệ thuộc object
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { user } = useAuthStore();
  const { loading, friendUsers } = useMyFriends(user?.id ?? 0, {
    getAll: true,
    enabled: showModal, // ✅ đóng modal = không fetch
  });

  // ✅ Khi modal mở, khởi tạo selectedIds theo initialTagged (một lần mỗi lần mở)
  const prevOpenRef = useRef<boolean>(false);
  useEffect(() => {
    const wasOpen = prevOpenRef.current;
    prevOpenRef.current = showModal;

    // Khi chuyển trạng thái: false -> true
    if (!wasOpen && showModal) {
      const ids = (initialTagged ?? []).map((u) => u.id);
      setSelectedIds(ids);
      // KHÔNG gọi onSetTagUsers ở đây để tránh ghi đè state của cha
    }
  }, [showModal, initialTagged]);

  // Lọc theo searchTerm
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return friendUsers;
    return friendUsers.filter((u) =>
      (u.fullName ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [friendUsers, searchTerm]);

  // ✅ Tính danh sách user đã chọn từ friendUsers + selectedIds
  const selectedUsers: User[] = useMemo(() => {
    if (!friendUsers?.length || !selectedIds.length) return [];
    const selectedSet = new Set(selectedIds);
    return friendUsers.filter((u) => selectedSet.has(u.id));
  }, [friendUsers, selectedIds]);

  // ✅ Chỉ sync ra ngoài KHI người dùng thao tác (selectedIds thay đổi),
  //    bỏ qua lần khởi tạo đầu khi modal mở.
  const firstSyncRef = useRef(true);
  useEffect(() => {
    if (firstSyncRef.current) {
      firstSyncRef.current = false;
      return; // bỏ qua lần đầu (khi mở modal)
    }
    const basics = selectedUsers.map((u) => mapUserToUserBasic(u));
    onSetTagUsers(basics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]); // cố ý không đưa onSetTagUsers vào deps để tránh loop

  // Chọn/Bỏ chọn user
  const handleSelectUser = (user: User) => {
    setSelectedIds((prev) => {
      const exists = prev.includes(user.id);
      return exists ? prev.filter((id) => id !== user.id) : [...prev, user.id];
    });
  };

  // Xóa khỏi danh sách đã chọn (chip)
  const handleRemoveUser = (userId: number) => {
    setSelectedIds((prev) => prev.filter((id) => id !== userId));
  };

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />

      <DialogContent
        className="
          w[90%] md:max-w-2xl 
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
              className="absolute right-4 p-1.5 rounded-md hover:bg-gray-100 transition text-green-600 hover:text-green-800"
              aria-label="Close"
            >
              {t("done")}
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Danh sách đã chọn */}
        {selectedUsers.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-3">
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

        <div className="p-4">
          <input
            type="text"
            placeholder={t("searchFriends")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

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
                const isSelected = selectedIds.includes(user.id);
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
