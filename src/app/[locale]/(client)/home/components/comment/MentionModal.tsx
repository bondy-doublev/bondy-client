import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useAuthStore } from "@/store/authStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import RoundedAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import React from "react";
import { mapUserToUserBasic, UserBasic } from "@/models/User";

interface MentionModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (user: UserBasic) => void;
}

export default function MentionModal({
  open,
  onClose,
  onSelect,
}: MentionModalProps) {
  const { user } = useAuthStore();
  const { loading, friendUsers } = useMyFriends(user?.id ?? 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/30" />
      <DialogContent className="max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle>Chọn người để gắn thẻ</DialogTitle>
        </DialogHeader>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-center text-gray-500">Đang tải...</p>
          ) : friendUsers.length === 0 ? (
            <p className="text-center text-gray-500">Không có bạn bè nào</p>
          ) : (
            friendUsers.map((friend) => (
              <div
                key={friend.id}
                onClick={() => {
                  onSelect(mapUserToUserBasic(friend));
                  onClose();
                }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                {friend.avatarUrl ? (
                  <RoundedAvatar
                    userId={friend.id}
                    avatarUrl={friend.avatarUrl}
                  />
                ) : (
                  <DefaultAvatar
                    userId={friend.id}
                    firstName={friend.fullName}
                  />
                )}
                <span className="text-sm font-medium">{friend.fullName}</span>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
