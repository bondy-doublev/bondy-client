// src/app/components/button/FriendButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FriendshipStatus } from "@/enums";
import { Friendship } from "@/models/Friendship";
import { friendService } from "@/services/friendService";
import { FaUserPlus, FaUserCheck, FaUserClock } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";

type FriendButtonProps = {
  t: (key: string) => string;
  wallUserId: number;
  currentUserId: number;
  friendship: Friendship | null;
  onChanged: (friendship: Friendship | null) => void;
  loadingStatus?: boolean; // 👈 thêm prop này
};

export default function FriendButton({
  t,
  wallUserId,
  currentUserId,
  friendship,
  onChanged,
  loadingStatus = false,
}: FriendButtonProps) {
  const [loading, setLoading] = useState(false);

  // nếu status đang load từ server → show nút loading, không đoán trạng thái
  if (loadingStatus) {
    return (
      <Button
        disabled
        className="flex items-center gap-2 px-3 h-9 text-sm font-medium rounded-md bg-gray-100 text-gray-500"
      >
        <FaUserPlus className="animate-pulse" />
        {t("loading") || "Loading..."}
      </Button>
    );
  }

  const status: FriendshipStatus | null = friendship?.status ?? null;
  const isSender = friendship ? friendship.senderId === currentUserId : false;

  // ===== label + icon =====
  let label = t("addFriend");
  let Icon: React.ComponentType<any> = FaUserPlus;

  if (status === FriendshipStatus.PENDING) {
    if (isSender) {
      label = t("requestSent");
      Icon = FaUserClock;
    } else {
      label = t("respondRequest");
      Icon = FaUserCheck;
    }
  } else if (status === FriendshipStatus.ACCEPTED) {
    label = t("friends");
    Icon = FaUserCheck;
  }

  // ===== màu theo trạng thái (tone green, không chói) =====
  const baseClass =
    "flex items-center gap-2 px-3 h-9 text-sm font-medium rounded-md transition-colors";

  let colorClass = "bg-emerald-500 hover:bg-emerald-600 text-white"; // default: Add friend

  if (status === FriendshipStatus.PENDING) {
    if (isSender) {
      colorClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";
    } else {
      colorClass = "bg-emerald-500 hover:bg-emerald-600 text-white";
    }
  } else if (status === FriendshipStatus.ACCEPTED) {
    colorClass = "bg-gray-100 hover:bg-gray-200 text-gray-800";
  }

  const btnClass = `${baseClass} ${colorClass}`;

  // ===== API actions =====
  const doSendRequest = async () => {
    setLoading(true);
    try {
      await friendService.sendFriendRequest(currentUserId, wallUserId);

      if (friendship) {
        onChanged({
          ...friendship,
          status: FriendshipStatus.PENDING,
          senderId: currentUserId,
          receiverId: wallUserId,
        });
      } else {
        onChanged({
          id: 0,
          userId: currentUserId,
          friendId: wallUserId,
          senderId: currentUserId,
          receiverId: wallUserId,
          status: FriendshipStatus.PENDING,
          requestedAt: new Date().toISOString(),
          senderInfo: {} as any,
          receiverInfo: {} as any,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const doAccept = async () => {
    setLoading(true);
    try {
      await friendService.acceptFriendRequest(
        currentUserId, // receiver
        wallUserId // sender
      );

      if (friendship) {
        onChanged({
          ...friendship,
          status: FriendshipStatus.ACCEPTED,
        });
      } else {
        onChanged({
          id: 0,
          userId: wallUserId,
          friendId: currentUserId,
          senderId: wallUserId,
          receiverId: currentUserId,
          status: FriendshipStatus.ACCEPTED,
          requestedAt: new Date().toISOString(),
          senderInfo: {} as any,
          receiverInfo: {} as any,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const doUnfriendOrCancel = async () => {
    setLoading(true);
    try {
      await friendService.unFriend(wallUserId);
    } finally {
      setLoading(false);
      onChanged(null);
    }
  };

  const renderMenuItems = () => {
    if (!status || status === FriendshipStatus.REJECTED) {
      return (
        <DropdownMenuItem
          onClick={doSendRequest}
          disabled={loading}
          className="cursor-pointer text-sm"
        >
          <FaUserPlus className="mr-2" />
          {t("addFriend")}
        </DropdownMenuItem>
      );
    }

    if (status === FriendshipStatus.PENDING) {
      if (isSender) {
        return (
          <DropdownMenuItem
            onClick={doUnfriendOrCancel}
            disabled={loading}
            className="cursor-pointer text-sm"
          >
            <FaUserClock className="mr-2" />
            {t("cancelRequest") ?? "Hủy lời mời"}
          </DropdownMenuItem>
        );
      }

      return (
        <>
          <DropdownMenuItem
            onClick={doAccept}
            disabled={loading}
            className="cursor-pointer text-sm"
          >
            <FaUserCheck className="mr-2" />
            {t("acceptRequest") ?? "Chấp nhận lời mời"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={doUnfriendOrCancel}
            disabled={loading}
            className="cursor-pointer text-sm"
          >
            <FaUserClock className="mr-2" />
            {t("rejectRequest") ?? "Từ chối lời mời"}
          </DropdownMenuItem>
        </>
      );
    }

    if (status === FriendshipStatus.ACCEPTED) {
      return (
        <DropdownMenuItem
          onClick={doUnfriendOrCancel}
          disabled={loading}
          className="cursor-pointer text-sm"
        >
          <FaUserPlus className="mr-2" />
          {t("unfriend") ?? "Hủy kết bạn"}
        </DropdownMenuItem>
      );
    }

    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={loading} className={btnClass}>
          <Icon />
          {label}
          <IoChevronDown className="text-xs" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white rounded-md shadow-md py-1">
        {renderMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
