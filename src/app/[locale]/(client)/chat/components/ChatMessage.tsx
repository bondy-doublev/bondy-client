"use client";
import React, {
  useEffect,
  useState,
  forwardRef,
  MouseEvent,
  useRef,
} from "react";
import { Message } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { FaFileAlt } from "react-icons/fa";
import Modal from "react-modal";

interface ChatMessageProps {
  msg: Message;
  replyMessage?: Message;
  onEdit: (msg: Message, newContent: string) => void;
  onDelete: (msg: Message) => void;
  onReply: (msg: Message) => void;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ msg, replyMessage, onEdit, onDelete, onReply }, ref) => {
    const { user } = useAuthStore();
    const [sender, setSender] = useState<{
      name: string;
      avatarUrl?: string;
    }>({ name: msg.senderId.toString() });
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImg, setModalImg] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    const isMine = String(msg.senderId) === String(user?.id);

    useEffect(() => {
      if (!isMine) {
        (async () => {
          try {
            const profile = await userService.getBasicProfile(
              Number(msg.senderId)
            );
            const { fullName, username, avatarUrl } = profile.data;
            setSender({
              name: fullName || username || msg.senderId.toString(),
              avatarUrl,
            });
          } catch {
            setSender({ name: msg.senderId.toString() });
          }
        })();
      } else {
        setSender({
          name: user?.fullName || user?.username || "Bạn",
          avatarUrl: user?.avatarUrl,
        });
      }
    }, [msg.senderId, isMine, user]);

    const handleLeftClick = (e: MouseEvent<HTMLDivElement>) => {
      if (e.type === "click" && replyMessage) {
        const el = document.getElementById(`msg-${replyMessage.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const originalBg = el.style.backgroundColor;
          el.style.backgroundColor = "#d4edda";
          setTimeout(() => (el.style.backgroundColor = originalBg), 1500);
        }
      }
    };

    const handleRightClick = (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setMenuVisible(true);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    };

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

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(e.target as Node) &&
          menuVisible
        ) {
          setMenuVisible(false);
        }
      };

      if (menuVisible)
        document.addEventListener("mousedown", handleClickOutside);
      else document.removeEventListener("mousedown", handleClickOutside);

      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [menuVisible]);

    const attachments = msg.attachments || [];
    const hasAttachments = attachments.length > 0;

    const containerClass =
      "flex mb-2 w-full " + (isMine ? "justify-end" : "justify-start");

    const bubbleClass =
      "p-2 rounded max-w-[70%] break-words cursor-pointer " +
      (isMine ? "bg-green-500 text-white" : "bg-blue-200 text-black");

    // Avatar fallback (chữ cái đầu)
    const renderAvatar = () => {
      if (sender.avatarUrl) {
        return (
          <img
            src={sender.avatarUrl}
            alt={sender.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        );
      } else {
        const initial = sender.name?.charAt(0)?.toUpperCase() || "?";
        return (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white font-semibold"
            title={sender.name}
          >
            {initial}
          </div>
        );
      }
    };

    return (
      <div ref={ref} className={containerClass} id={`msg-${msg.id}`}>
        {!isMine && <div className="mr-2">{renderAvatar()}</div>}

        <div
          className={bubbleClass}
          onClick={handleLeftClick}
          onContextMenu={handleRightClick}
        >
          {replyMessage && (
            <div className="bg-gray-100 text-gray-500 p-1 rounded mb-1 text-xs italic max-w-full cursor-pointer hover:bg-gray-200">
              {replyMessage.isDeleted
                ? "<Đã xóa>"
                : replyMessage.content
                ? replyMessage.content
                : replyMessage.attachments?.length
                ? replyMessage.attachments
                    .map((a) => (a.type === "image" ? "Image" : "File"))
                    .join(", ")
                : "<Không có nội dung>"}
            </div>
          )}

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

          <div className="text-sm mt-1">
            {msg.isDeleted ? <i>Đã xóa</i> : msg.content}{" "}
            {msg.isEdited && !msg.isDeleted && <span>(edited)</span>}
          </div>

          <div
            className={`text-xs ${
              isMine ? "text-white text-right" : "text-gray-600 text-left"
            } mt-1`}
          >
            {new Date(msg.createdAt).toLocaleString([], {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          {menuVisible && menuPosition && (
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: menuPosition.y,
                left: menuPosition.x,
                background: "white",
                border: "1px solid #ccc",
                borderRadius: 4,
                zIndex: 1000,
              }}
            >
              <button
                className={`px-2 py-1 w-full text-md text-left hover:bg-gray-200 ${
                  isMine ? "text-black" : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={isMine ? handleEdit : undefined}
              >
                Edit
              </button>
              <button
                className={`px-2 py-1 w-full text-md text-left hover:bg-gray-200 ${
                  isMine ? "text-black" : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={isMine ? handleDelete : undefined}
              >
                Delete
              </button>
              <button
                className="px-2 py-1 w-full text-left text-black text-md hover:bg-gray-200"
                onClick={handleReply}
              >
                Reply
              </button>
            </div>
          )}
        </div>

        {isMine && <div className="ml-2">{renderAvatar()}</div>}

        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          className="flex items-center justify-center"
          overlayClassName="fixed inset-0 flex items-center justify-center"
          style={{
            overlay: { backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1000 },
            content: {
              inset: "auto",
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
  }
);

ChatMessage.displayName = "ChatMessage";
