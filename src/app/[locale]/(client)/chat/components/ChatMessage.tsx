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
import { FaFileAlt } from "react-icons/fa";
import { useTranslations } from "use-intl";
import { UniversalConfirmDialog } from "@/components/common/ConfirmModal";
import { SharedPostCard } from "./SharedPostCard";
import { resolveFileUrl } from "@/utils/fileUrl";
import MediaModal from "@/app/[locale]/(wall)/user/components/MediaModal";

interface ChatMessageProps {
  msg: Message;
  replyMessage?: Message;
  onEdit: (msg: Message, newContent: string) => void;
  onDelete: (msg: Message) => void;
  onReply: (msg: Message) => void;
  isInPopup?: boolean;
  currentUserId: number;
  userProfilesMap: Map<number, { name: string; avatarUrl?: string }>;
}

type ModalItem = {
  url: string;
  type: "image" | "video";
};

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      msg,
      replyMessage,
      onEdit,
      onDelete,
      onReply,
      isInPopup = false,
      currentUserId,
      userProfilesMap,
    },
    ref
  ) => {
    const { user } = useAuthStore();
    const t = useTranslations("chat");

    const isMine = Number(msg.senderId) === currentUserId;

    // Lấy thông tin người gửi
    const senderProfile = isMine
      ? {
          name: user?.fullName || user?.firstName || t("you"),
          avatarUrl: user?.avatarUrl,
        }
      : userProfilesMap.get(Number(msg.senderId)) || {
          name: `User ${msg.senderId}`,
        };

    const senderName = senderProfile.name;
    const senderAvatar = senderProfile.avatarUrl;

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [isEditingInline, setIsEditingInline] = useState(false);
    const [draftContent, setDraftContent] = useState(msg.content || "");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [mediaItems, setMediaItems] = useState<ModalItem[]>([]);
    const [mediaInitialIndex, setMediaInitialIndex] = useState(0);

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
      setDraftContent(msg.content || "");
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

    const isImageFile = (url: string) =>
      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
    const isVideoFile = (url: string) =>
      /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);

    const openMediaModal = (clickedUrl: string) => {
      const items: ModalItem[] = [];
      const attachments = msg.attachments || [];

      attachments.forEach((a) => {
        if (a.type === "image" || (a.type === "file" && isImageFile(a.url))) {
          items.push({ url: a.url, type: "image" });
        } else if (a.type === "file" && isVideoFile(a.url)) {
          items.push({ url: a.url, type: "video" });
        }
      });

      if (
        msg.imageUrl &&
        isImageFile(msg.imageUrl) &&
        !items.some((i) => i.url === msg.imageUrl)
      ) {
        items.push({ url: msg.imageUrl, type: "image" });
      }
      if (
        msg.fileUrl &&
        isVideoFile(msg.fileUrl) &&
        !items.some((i) => i.url === msg.fileUrl)
      ) {
        items.push({ url: msg.fileUrl, type: "video" });
      }

      if (items.length === 0) return;

      const clickedIndex = items.findIndex((item) => item.url === clickedUrl);
      setMediaItems(items);
      setMediaInitialIndex(clickedIndex >= 0 ? clickedIndex : 0);
      setMediaModalOpen(true);
    };

    useEffect(() => {
      if (!menuVisible) return;
      const handleClickOutside = (e: globalThis.MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          setMenuVisible(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [menuVisible]);

    const attachments = msg.attachments || [];

    const containerClass = `flex mb-2 w-full ${
      isMine ? "justify-end" : "justify-start"
    }`;
    const maxBubbleWidth = isInPopup ? "max-w-[85%]" : "max-w-[70%]";
    const bubbleClass = `p-3 rounded-lg ${maxBubbleWidth} break-words cursor-pointer shadow-sm ${
      isMine ? "bg-green-500 text-white" : "bg-blue-100 text-black"
    }`;

    const renderAvatar = () => {
      if (senderAvatar) {
        return (
          <img
            src={resolveFileUrl(senderAvatar)}
            alt={senderName}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
        );
      }
      const initial = senderName.charAt(0).toUpperCase() || "?";
      return (
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-500 text-white font-bold flex-shrink-0"
          title={senderName}
        >
          {initial}
        </div>
      );
    };

    return (
      <div ref={ref} className={containerClass} id={`msg-${msg.id}`}>
        {!isMine && <div className="mr-3 mt-2">{renderAvatar()}</div>}

        <div
          className={bubbleClass}
          onClick={handleLeftClick}
          onContextMenu={handleRightClick}
        >
          {replyMessage && (
            <div className="bg-white/30 backdrop-blur-sm text-gray-700 p-2 rounded mb-2 text-sm italic max-w-full cursor-pointer hover:bg-white/50 transition">
              {replyMessage.isDeleted
                ? t("deleted")
                : replyMessage.content || replyMessage.sharedPost
                ? `${replyMessage.sharedPost?.title ?? replyMessage.content}`
                : replyMessage.attachments?.length || replyMessage.fileUrl
                ? t("media")
                : t("noContent")}
            </div>
          )}

          {msg.isDeleted ? (
            <i className="opacity-70">{t("deleted")}</i>
          ) : isEditingInline ? (
            <div className="flex flex-col gap-3 mt-2">
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsEditingInline(false);
                    setDraftContent(msg.content || "");
                  }}
                  className="px-4 py-1.5 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={() => {
                    onEdit(msg, draftContent.trim());
                    setIsEditingInline(false);
                  }}
                  className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {t("save")}
                </button>
              </div>
            </div>
          ) : (
            msg.content && (
              <div className="whitespace-pre-wrap">{msg.content}</div>
            )
          )}

          {msg.sharedPost && !msg.isDeleted && (
            <div className="mt-3">
              <SharedPostCard sharedPost={msg.sharedPost} isMine={isMine} />
            </div>
          )}

          {!msg.isDeleted && (attachments.length > 0 || msg.fileUrl) && (
            <div className="flex flex-wrap gap-3 mt-3">
              {attachments.map((a, idx) => {
                const isActualImage =
                  a.type === "image" ||
                  (a.type === "file" && isImageFile(a.url));
                const isActualVideo = a.type === "file" && isVideoFile(a.url);

                if (isActualImage || isActualVideo) {
                  return (
                    <div
                      key={a.url + idx}
                      className={`relative cursor-pointer rounded-lg overflow-hidden ${
                        isInPopup ? "max-w-[200px]" : "w-40 h-40"
                      } bg-black/20`}
                      onClick={() => openMediaModal(a.url)}
                    >
                      {isActualImage ? (
                        <img
                          src={resolveFileUrl(a.url)}
                          alt={a.fileName || "media"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={resolveFileUrl(a.url)}
                          className="w-full h-full object-cover"
                          muted
                        />
                      )}
                      {isActualVideo && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/60 rounded-full p-4">
                            <svg
                              className="w-10 h-10 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <a
                    key={idx}
                    href={resolveFileUrl(a.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm"
                  >
                    <FaFileAlt className="text-xl" />
                    <span className="truncate max-w-[180px]">
                      {a.fileName || a.url.split("/").pop()}
                    </span>
                  </a>
                );
              })}

              {!attachments.length &&
                msg.imageUrl &&
                isImageFile(msg.imageUrl) && (
                  <img
                    src={resolveFileUrl(msg.imageUrl)}
                    alt="img"
                    className={`rounded-lg object-cover cursor-pointer ${
                      isInPopup
                        ? "max-w-[200px] max-h-[200px]"
                        : "max-w-md w-full h-full"
                    }`}
                    onClick={() => openMediaModal(msg.imageUrl!)}
                  />
                )}
            </div>
          )}

          <div
            className={`text-xs flex items-center gap-1 mt-1 ${
              isMine
                ? "text-white/80 justify-end"
                : "text-gray-600 justify-start"
            }`}
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
        </div>

        {isMine && <div className="ml-3 mt-2">{renderAvatar()}</div>}

        {menuVisible && menuPosition && (
          <div
            ref={menuRef}
            className="fixed bg-white border border-gray-300 rounded-lg shadow-xl py-2 z-[10000] min-w-[140px]"
            style={{ top: menuPosition.y, left: menuPosition.x }}
          >
            <button
              className={`px-4 py-2 w-full text-left hover:bg-gray-100 transition ${
                isMine ? "text-black" : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={isMine ? handleEdit : undefined}
              disabled={!isMine}
            >
              {t("edit")}
            </button>
            <button
              className={`px-4 py-2 w-full text-left hover:bg-gray-100 transition ${
                isMine ? "text-red-600" : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={isMine ? handleDelete : undefined}
              disabled={!isMine}
            >
              {t("delete")}
            </button>
            <button
              className="px-4 py-2 w-full text-left text-black hover:bg-gray-100 transition"
              onClick={handleReply}
            >
              {t("reply")}
            </button>
          </div>
        )}

        <MediaModal
          open={mediaModalOpen}
          onClose={() => setMediaModalOpen(false)}
          items={mediaItems}
          initialIndex={mediaInitialIndex}
        />

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
