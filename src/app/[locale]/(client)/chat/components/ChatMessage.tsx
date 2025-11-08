"use client";
import React, { useEffect, useState } from "react";
import { Message } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { FaFileAlt, FaFileImage } from "react-icons/fa";
import Modal from "react-modal";

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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImg, setModalImg] = useState("");

  const isMine = String(msg.senderId) === String(user?.id);

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

  const openModal = (img: string) => {
    setModalImg(img);
    setModalOpen(true);
  };

  const attachments = msg.attachments || [];
  const hasAttachments = attachments.length > 0;

  const containerClass =
    "flex mb-2 flex-col " + (isMine ? "items-end" : "items-start");
  const bubbleClass =
    "p-2 rounded max-w-[70%] break-words cursor-pointer " +
    (isMine ? "bg-green-500 text-white" : "bg-gray-200 text-black");

  return (
    <div className={containerClass}>
      <div className={bubbleClass} onClick={handleClick}>
        {/* Attachments */}
        <div className="flex flex-wrap gap-2 mt-1">
          {hasAttachments &&
            attachments.slice(0, 4).map((a) =>
              a.type === "image" ? (
                <img
                  key={a.url}
                  src={a.url}
                  alt={a.fileName}
                  className="w-20 h-20 object-cover rounded cursor-pointer"
                  onClick={() => openModal(a.url)}
                />
              ) : (
                <a
                  key={a.url}
                  href={a.url}
                  target="_blank"
                  className="text-blue-500 text-xs max-w-[80px] truncate"
                >
                  <FaFileAlt className="inline mr-1" />
                  {a.fileName || a.url.split("/").pop()}
                </a>
              )
            )}
          {!hasAttachments && msg.imageUrl && (
            <img
              src={msg.imageUrl}
              alt="img"
              className="max-w-xs rounded mt-1"
            />
          )}
          {!hasAttachments && msg.fileUrl && (
            <a
              href={msg.fileUrl}
              target="_blank"
              className="text-blue-500 mt-1 block"
            >
              {msg.fileUrl.split("/").pop()}
            </a>
          )}
        </div>

        {/* Nội dung tin nhắn */}
        <div className="text-sm mt-1">
          {!isMine && <b>{senderName}: </b>}
          {msg.isDeleted ? <i>Đã xóa</i> : msg.content}{" "}
          {msg.isEdited && !msg.isDeleted && <span>(edited)</span>}
        </div>

        {/* Thời gian */}
        <div className="text-xs text-gray-500 text-right mt-1">
          {new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Menu toggle */}
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

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="flex items-center justify-center"
        overlayClassName="fixed inset-0 flex items-center justify-center"
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.9)", // 50% mờ
            zIndex: 1000,
          },
          content: {
            inset: "auto", // để căn giữa
            padding: 0,
            border: "none",
            background: "transparent",
          },
        }}
      >
        <img
          src={modalImg}
          alt="Zoom"
          className="max-h-[80vh] max-w-[90vw] rounded"
        />
      </Modal>
    </div>
  );
};
