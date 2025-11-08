"use client";
import React, { useEffect, useState } from "react";
import { Message } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";

interface ChatMessageProps {
  msg: Message;
  onEdit: (msg: Message, newContent: string) => void;
  onDelete: (msg: Message) => void;
  onReply: (msg: Message) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  msg,
  onEdit,
  onDelete,
  onReply,
}) => {
  const { user } = useAuthStore();
  const [senderName, setSenderName] = useState(msg.senderId);
  const [menuVisible, setMenuVisible] = useState(false);

  const isMine = String(msg.senderId) === String(user?.id);

  // Lấy tên người gửi
  useEffect(() => {
    if (!isMine) {
      (async () => {
        try {
          const profile = await userService.getBasicProfile(
            Number(msg.senderId)
          );
          setSenderName(
            profile.data.fullName || profile.data.username || msg.senderId
          );
        } catch {
          setSenderName(msg.senderId);
        }
      })();
    } else {
      setSenderName("Bạn");
    }
  }, [msg.senderId, isMine]);

  const containerClass =
    "flex mb-2 flex-col " + (isMine ? "items-end" : "items-start");
  const bubbleClass =
    "p-2 rounded max-w-[70%] break-words cursor-pointer " +
    (isMine ? "bg-green-500 text-white" : "bg-gray-200 text-black");

  const handleClick = () => setMenuVisible((prev) => !prev);

  const handleEdit = () => {
    const newContent = prompt("Chỉnh sửa tin nhắn:", msg.content);
    if (newContent !== null) onEdit(msg, newContent);
    setMenuVisible(false);
  };

  const handleDelete = () => {
    if (confirm("Xác nhận xóa tin nhắn?")) onDelete(msg);
    setMenuVisible(false);
  };

  const handleReply = () => {
    onReply(msg);
    setMenuVisible(false);
  };

  return (
    <div className={containerClass}>
      <div className={bubbleClass} onClick={handleClick}>
        <div className="text-sm">
          {!isMine && <b>{senderName}: </b>}
          {msg.isDeleted ? <i>Đã xóa</i> : msg.content}{" "}
          {msg.isEdited && !msg.isDeleted && <span>(edited)</span>}
        </div>
        <div className="text-xs text-gray-500 text-right mt-1">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Menu toggle hiện/ẩn */}
        {menuVisible && (
          <div className="flex space-x-2 mt-1 text-xs">
            <button
              className={`px-2 py-1 rounded hover:bg-gray-200 ${
                isMine ? "" : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={isMine ? handleEdit : undefined}
            >
              Edit
            </button>
            <button
              className={`px-2 py-1 rounded hover:bg-gray-200 ${
                isMine ? "" : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={isMine ? handleDelete : undefined}
            >
              Delete
            </button>
            <button
              className="px-2 py-1 rounded hover:bg-gray-200"
              onClick={handleReply}
            >
              Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
