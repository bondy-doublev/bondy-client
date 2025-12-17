"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message, chatService } from "@/services/chatService";
import { ChatMessage } from "./ChatMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaMinus, FaTimes, FaPaperclip, FaExpand } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useChat } from "@/app/providers/ChatProvider";
import {
  uploadCloudinaryMultiple,
  uploadCloudinarySingle,
} from "@/services/uploadService";
import { toast } from "react-toastify";

interface ChatBoxPopupProps {
  roomId: string;
  roomName: string;
  roomAvatar?: string;
  currentUserId: number;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

export const ChatBoxPopup: React.FC<ChatBoxPopupProps> = ({
  roomId,
  roomName,
  roomAvatar,
  currentUserId,
  onClose,
  onMinimize,
  isMinimized,
}) => {
  const t = useTranslations("chat");
  const router = useRouter();
  const pathname = usePathname();
  const { socket: chatSocket } = useChat();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const roomIdRef = useRef(roomId);

  // ✅ Update ref when roomId changes
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // ✅ Load initial messages
  useEffect(() => {
    if (!isMinimized && roomId) {
      loadMessages();

      // Join room socket
      if (chatSocket) {
        chatSocket.socket.emit("joinRoom", {
          roomId,
          userId: currentUserId,
        });
      }
    }
  }, [roomId, isMinimized, chatSocket]);

  // ✅ Socket realtime listener
  useEffect(() => {
    if (!chatSocket) return;

    const s = chatSocket.socket;

    const handleNewMessage = (msg: Message) => {
      console.log("📨 New message in popup:", msg);

      if (msg.roomId === roomIdRef.current) {
        setMessages((prev) => {
          // Tránh duplicate (check by id hoặc timestamp)
          const exists = prev.find((m) => m.id === msg.id);
          if (exists) return prev;

          return [...prev, msg];
        });

        // Auto scroll
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    const handleEdited = (msg: Message) => {
      if (msg.roomId === roomIdRef.current) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      }
    };

    const handleDeleted = (msg: Message) => {
      if (msg.roomId === roomIdRef.current) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      }
    };

    s.on("newMessage", handleNewMessage);
    s.on("messageEdited", handleEdited);
    s.on("messageDeleted", handleDeleted);

    return () => {
      s.off("newMessage", handleNewMessage);
      s.off("messageEdited", handleEdited);
      s.off("messageDeleted", handleDeleted);
    };
  }, [chatSocket]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getRoomMessages(roomId, 1, 50);
      setMessages(data.reverse());
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // ✅ Send message with file upload
  const handleSend = async () => {
    if (uploading) return;
    if (!newMsg.trim() && attachments.length === 0) return;
    if (!chatSocket) return;

    setUploading(true);

    try {
      let fileUrl = "";
      let uploadedAttachments: {
        url: string;
        type: "image" | "file";
        fileName?: string;
      }[] = [];

      // Upload files
      if (attachments.length === 1) {
        const uploaded = await uploadCloudinarySingle(attachments[0]);
        fileUrl = uploaded;
      } else if (attachments.length > 1) {
        const uploadedUrls = await uploadCloudinaryMultiple(attachments);
        uploadedAttachments = uploadedUrls.map((url, i) => ({
          url,
          fileName: attachments[i].name,
          type: attachments[i].type.startsWith("image") ? "image" : "file",
        }));
      }

      const payload = {
        roomId,
        senderId: currentUserId,
        content: newMsg.trim(),
        replyToMessageId: replyingMessage?.id,
        fileUrl: fileUrl.length > 0 ? fileUrl : undefined,
        imageUrl: fileUrl.length > 0 ? fileUrl : undefined,
        attachments: uploadedAttachments.length
          ? uploadedAttachments
          : undefined,
      };

      // Send via socket
      chatSocket.sendMessage(payload);

      setNewMsg("");
      setAttachments([]);
      setReplyingMessage(null);

      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error(t("uploadFileFailed"));
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachments(Array.from(e.target.files));
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // ✅ Expand with locale
  const handleExpand = () => {
    const locale = pathname.split("/")[1] || "en";
    const targetUrl = `/${locale}/chat? tab=personal&roomId=${roomId}`;

    console.log("🔗 Expanding to:", targetUrl);

    router.push(targetUrl);
    onClose();
  };

  // ✅ Edit message
  const handleEditMessage = async (msg: Message, newContent: string) => {
    if (!chatSocket) return;

    try {
      await chatService.editMessage(msg.id, newContent, currentUserId);
      chatSocket.updateMessage(msg.id as any, newContent);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msg.id ? { ...m, content: newContent, isEdited: true } : m
        )
      );
    } catch (err) {
      console.error(err);
      toast.error(t("editMessageFailed"));
    }
  };

  // ✅ Delete message
  const handleDeleteMessage = async (msg: Message) => {
    if (!chatSocket) return;

    try {
      await chatService.deleteMessage(msg.id, currentUserId);
      chatSocket.deleteMessage(msg.id as any);

      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, isDeleted: true } : m))
      );
    } catch (err) {
      console.error(err);
      toast.error(t("deleteMessageFailed"));
    }
  };

  // Avatar fallback
  const renderAvatar = () => {
    if (roomAvatar) {
      return (
        <img
          src={roomAvatar}
          alt={roomName}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    const initial = roomName?.charAt(0)?.toUpperCase() || "? ";
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white font-semibold">
        {initial}
      </div>
    );
  };

  return (
    <div
      className={`fixed bottom-0 right-4 bg-white shadow-2xl rounded-t-lg border border-gray-300 flex flex-col transition-all duration-300 z-[9999]`}
      style={{
        width: "350px",
        height: isMinimized ? "50px" : "500px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          {renderAvatar()}
          <span className="font-semibold truncate max-w-[180px]">
            {roomName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExpand}
            className="hover:bg-blue-700 p-1 rounded"
            title={t("expandToFullChat")}
          >
            <FaExpand size={14} />
          </button>
          <button
            onClick={onMinimize}
            className="hover:bg-blue-700 p-1 rounded"
            title={isMinimized ? t("maximize") : t("minimize")}
          >
            <FaMinus size={14} />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-blue-700 p-1 rounded"
            title={t("close")}
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      {/* Body - Messages */}
      {!isMinimized && (
        <>
          <div
            ref={messageContainerRef}
            className="flex-1 p-3 space-y-2 bg-gray-50 overflow-y-auto"
          >
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 text-sm">
                {t("noMessagesYet")}
              </div>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage
                  key={msg.id || index}
                  msg={msg}
                  replyMessage={messages.find(
                    (x) => x.id === msg.replyToMessageId
                  )}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                  onReply={setReplyingMessage}
                  isInPopup={true}
                />
              ))
            )}
            <div ref={messageEndRef} />
          </div>

          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="p-2 border-t border-gray-200 flex flex-wrap gap-2 bg-gray-100 max-h-24 overflow-y-auto">
              {attachments.map((file, i) => (
                <div
                  key={i}
                  className="relative border rounded p-1 flex items-center gap-1 bg-white"
                >
                  {file.type.startsWith("image") ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <span className="text-xs max-w-[60px] truncate">
                      {file.name}
                    </span>
                  )}
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                    onClick={() => removeAttachment(i)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reply Preview */}
          {replyingMessage && (
            <div className="px-3 py-2 border-t border-gray-200 bg-gray-100 text-xs text-gray-600 italic flex justify-between items-center">
              <span className="truncate">
                {t("replyingTo")}: {replyingMessage.content || t("attachment")}
              </span>
              <button
                onClick={() => setReplyingMessage(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="p-2 border-t border-gray-200 flex items-center gap-2 bg-white">
            <label className="cursor-pointer text-gray-600 hover:text-gray-800">
              <FaPaperclip size={16} />
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </label>

            <Input
              placeholder={t("typeAMessage")}
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={uploading}
              className="flex-1 text-sm h-8"
            />

            <Button
              onClick={handleSend}
              disabled={uploading}
              size="sm"
              className="h-8"
            >
              {uploading ? "..." : t("send")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
