"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateRoomDialogProps {
  friends: any[];
  selectedFriends: string[];
  onClose: () => void;
  onSelectFriend: (id: string, checked: boolean) => void;
  onCreate: () => void;
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
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-80 max-h-[70vh] flex flex-col">
        <h2 className="text-lg font-bold mb-4">
          {tab === "personal" ? "New Chat" : "New Group"}
        </h2>
        <div className="flex-1 overflow-auto space-y-2 mb-4">
          {friends.map((f) => (
            <label key={f.id} className="flex items-center space-x-2">
              <Checkbox
                checked={selectedFriends.includes(f.id)}
                onCheckedChange={(checked) => onSelectFriend(f.id, !!checked)}
              />
              <span>{f.fullName}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={onCreate}>Tạo phòng</Button>
        </div>
      </div>
    </div>
  );
};
