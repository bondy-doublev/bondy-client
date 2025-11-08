"use client";
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";

interface CreateRoomDialogProps {
  friends: any[];
  selectedFriends: string[];
  onClose: () => void;
  onSelectFriend: (id: string, checked: boolean) => void;
  onCreate: (nameOrId?: string) => void;
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
  const [privateRoomFriendIds, setPrivateRoomFriendIds] = useState<string[]>(
    []
  );
  const { user } = useAuthStore();
  const modalRef = useRef<HTMLDivElement>(null);

  // --- Load private rooms để lọc friend đã có hội thoại
  const handleGetConversations = async () => {
    if (!user) return;
    const res = await chatService.getPrivateRooms(user.id);
    const friendIds = res.map((room: any) => room.members[0].id.toString());
    setPrivateRoomFriendIds(friendIds);
  };

  useEffect(() => {
    handleGetConversations();
  }, [user]);

  // --- Click outside modal để tắt
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Nếu personal
  const handleClickFriend = (id: string) => {
    if (tab === "personal") {
      onCreate(id); // tạo room ngay
    }
  };

  // --- Lọc friend nếu personal tab
  const filteredFriends =
    tab === "personal"
      ? friends.filter((f) => !privateRoomFriendIds.includes(f.id.toString()))
      : friends;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded shadow-lg w-80 max-h-[70vh] flex flex-col"
      >
        <h2 className="text-lg font-bold mb-4">
          {tab === "personal" ? "New Chat" : "New Group"}
        </h2>

        {tab === "group" && (
          <Input
            placeholder="Tên nhóm"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mb-4"
          />
        )}

        <div className="flex-1 overflow-auto space-y-2 mb-4">
          {filteredFriends.map((f) => (
            <label
              key={f.id}
              className={`flex items-center space-x-2 cursor-pointer ${
                tab === "personal" ? "hover:bg-gray-100 p-1 rounded" : ""
              }`}
              onClick={() =>
                tab === "personal" ? handleClickFriend(f.id) : undefined
              }
            >
              {tab === "group" && (
                <Checkbox
                  checked={selectedFriends.includes(f.id)}
                  onCheckedChange={(checked) => onSelectFriend(f.id, !!checked)}
                />
              )}
              <span>{f.fullName}</span>
            </label>
          ))}
          {filteredFriends.length === 0 && tab === "personal" && (
            <p className="text-gray-500 text-sm">
              Không còn bạn bè nào để chat.
            </p>
          )}
        </div>

        {tab === "group" && (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={() => onCreate(groupName)}
              disabled={!groupName || selectedFriends.length < 2}
            >
              Tạo phòng
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
