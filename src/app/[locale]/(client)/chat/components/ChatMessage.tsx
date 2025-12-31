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
import { useTranslations } from "use-intl";
import { UniversalConfirmDialog } from "@/components/common/ConfirmModal";
import { SharedPostCard } from "./SharedPostCard";
import { resolveFileUrl } from "@/utils/fileUrl";

interface ChatMessageProps {
  msg: Message;
  replyMessage?: Message;
  onEdit: (msg: Message, newContent: string) => void;
  onDelete: (msg: Message) => void;
  onReply: (msg: Message) => void;
  isInPopup?: boolean;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ msg, replyMessage, onEdit, onDelete, onReply, isInPopup }, ref) => {
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
    const [isEditingInline, setIsEditingInline] = useState(false);
    const [draftContent, setDraftContent] = useState(msg.content);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const t = useTranslations("chat");

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
          name: user?.fullName || user?.username || t("you"),
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
      setDraftContent(msg.content);
      setIsEditingInline(true);
      setMenuVisible(false);
    };

    const handleDelete = () => {
      setMenuVisible(false);
      setDeleteDialogOpen(true);
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

    const maxBubbleWidth = isInPopup ? "max-w-[85%]" : "max-w-[70%]";

    const bubbleClass =
      `p-2 rounded ${maxBubbleWidth} break-words cursor-pointer ` +
      (isMine ? "bg-green-500 text-white" : "bg-blue-200 text-black");

    // Avatar fallback (chữ cái đầu)
    const renderAvatar = () => {
      if (sender.avatarUrl) {
        return (
          <img
            src={resolveFileUrl(sender.avatarUrl)}
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
                ? t("deleted")
                : replyMessage.content
                ? replyMessage.content
                : replyMessage.sharedPost
                ? `📤 ${replyMessage.sharedPost.title}`
                : replyMessage.attachments?.length
                ? replyMessage.attachments
                    .map((a) => (a.type === "image" ? t("image") : t("file")))
                    .join(", ")
                : replyMessage.imageUrl
                ? t("image")
                : replyMessage.fileUrl
                ? t("file")
                : t("noContent")}
            </div>
          )}

          {/* Nội dung text - hiển thị trước shared post */}
          <div className="text-sm mt-1 w-full">
            {msg.isDeleted ? (
              <i>{t("deleted")}</i>
            ) : isEditingInline ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  className="w-full border rounded p-2 h-20 focus:outline-none text-black"
                />

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsEditingInline(false);
                      setDraftContent(msg.content);
                    }}
                    className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-green-600"
                  >
                    {t("cancel")}
                  </button>

                  <button
                    onClick={() => {
                      onEdit(msg, draftContent || "");
                      setIsEditingInline(false);
                    }}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {t("save")}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {msg.content && (
                  <div className="whitespace-pre-wrap mb-2">{msg.content}</div>
                )}
              </>
            )}
          </div>

          {/* Shared Post Card */}
          {msg.sharedPost && !msg.isDeleted && (
            <SharedPostCard sharedPost={msg?.sharedPost} isMine={isMine} />
          )}

          {/* Attachments */}
          {!msg.sharedPost && (
            <div className="flex flex-wrap gap-2 mt-1">
              {hasAttachments &&
                attachments.slice(0, 4).map((a, index) =>
                  a.type === "image" ? (
                    <img
                      key={index}
                      src={resolveFileUrl(a.url)}
                      alt={a.fileName}
                      className={`object-cover rounded cursor-pointer ${
                        isInPopup ? "max-w-[200px] max-h-[200px]" : "w-20 h-20"
                      }`}
                      onClick={() => openModal(a.url)}
                    />
                  ) : (
                    <a
                      key={index}
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
                  src={resolveFileUrl(msg.imageUrl)}
                  alt="img"
                  className={`rounded mt-1 object-cover ${
                    isInPopup
                      ? "max-w-[200px] max-h-[200px]"
                      : "max-w-full md:max-w-xs h-auto"
                  }`}
                />
              )}
              {!hasAttachments && msg.fileUrl && !msg.imageUrl && (
                <a
                  href={msg.fileUrl}
                  target="_blank"
                  className="text-blue-500 mt-1 block"
                >
                  {msg.fileUrl.split("/").pop()}
                </a>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div
            className={`text-xs flex items-center gap-1 ${
              isMine ? "text-white justify-end" : "text-gray-600 justify-start"
            } mt-1`}
          >
            <span>
              {new Date(msg.createdAt).toLocaleString([], {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {msg.isEdited && (
              <span className="opacity-70">({t("edited")})</span>
            )}
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
                {t("edit")}
              </button>
              <button
                className={`px-2 py-1 w-full text-md text-left hover:bg-gray-200 ${
                  isMine ? "text-black" : "text-gray-400 cursor-not-allowed"
                }`}
                onClick={isMine ? handleDelete : undefined}
              >
                {t("delete")}
              </button>
              <button
                className="px-2 py-1 w-full text-left text-black text-md hover:bg-gray-200"
                onClick={handleReply}
              >
                {t("reply")}
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
            src={resolveFileUrl(modalImg)}
            alt="Zoom"
            className="max-h-[80vh] max-w-[90vw] rounded"
          />
        </Modal>
        <UniversalConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => {
            onDelete(msg);
            setDeleteDialogOpen(false);
          }}
          type="danger"
          title={t("delete")}
          description={t("deleteConfirm")}
          confirmLabel={t("delete")}
          cancelLabel={t("cancel")}
        />
      </div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
