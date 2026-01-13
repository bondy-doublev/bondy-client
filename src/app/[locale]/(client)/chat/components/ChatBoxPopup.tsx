"use client";

import React, { useEffect, useRef, useState } from "react";
import { Message, chatService } from "@/services/chatService";
import { ChatMessage } from "./ChatMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  FaMinus,
  FaTimes,
  FaPaperclip,
  FaExpand,
  FaVideo,
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useChat } from "@/app/providers/ChatProvider";
import { useCall } from "@/context/CallContext";
import { useRingtone } from "@/app/hooks/useRingTone";
import {
  uploadLocalMultiple,
  uploadLocalSingle,
} from "@/services/uploadService";
import { toast } from "react-toastify";
import { addDoc, collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/configs/firebase";
import { resolveFileUrl } from "@/utils/fileUrl";
import Spinner from "@/app/components/ui/spinner";
import { userService } from "@/services/userService";

interface ChatBoxPopupProps {
  roomId: string;
  roomName: string;
  roomAvatar?: string;
  currentUserId: number;
  onClose: () => void;
  onMinimize: () => void;
  isMinimized: boolean;
}

const PAGE_SIZE = 20;

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
  const { setOutgoingCallId, outgoingCallId, setOutgoingCallReceiver } =
    useCall();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [roomMembers, setRoomMembers] = useState<number[]>([]);
  const [callStatus, setCallStatus] = useState<string | null>(null);

  const [userProfilesMap, setUserProfilesMap] = useState<
    Map<number, { name: string; avatarUrl?: string }>
  >(new Map());

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const roomIdRef = useRef(roomId);

  const previousScrollHeight = useRef<number>(0);
  const previousScrollTop = useRef<number>(0);

  const isRinging = !!outgoingCallId && callStatus === "ringing";
  useRingtone(isRinging);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(true);
    setInitialLoaded(false);
    setLoadingMore(false);
    setUserProfilesMap(new Map());
  }, [roomId]);

  useEffect(() => {
    if (isMinimized) {
      setInitialLoaded(false);
    }
  }, [isMinimized]);

  // Fetch room info + profiles
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomAndProfiles = async () => {
      try {
        const room = await chatService.getRoomInformation(roomId);

        const otherMembers = room.members.map((m: any) => m.userId);
        setRoomMembers(otherMembers);

        console.log("userIDssssss: ", otherMembers);

        if (otherMembers.length === 0) {
          setUserProfilesMap(new Map());
          return;
        }

        try {
          const res = await userService.getBasicProfiles(otherMembers);
          const profiles = res.data || res;

          const newMap = new Map<
            number,
            { name: string; avatarUrl?: string }
          >();

          profiles.forEach((p: any) => {
            // Linh hoạt lấy userId từ nhiều field có thể
            const rawId = p.userId ?? p.id ?? p.Id ?? p.UserId ?? p.userid;
            const userId = rawId != null ? Number(rawId) : null;

            if (userId != null && !isNaN(userId)) {
              newMap.set(userId, {
                name:
                  p.fullName ||
                  p.username ||
                  p.displayName ||
                  p.name ||
                  `User ${userId}`,
                avatarUrl:
                  p.avatarUrl || p.avatar || p.profileImage || undefined,
              });
            }
          });

          console.log("Final fixed profiles map:", Object.fromEntries(newMap));
          setUserProfilesMap(newMap);
        } catch (err) {
          console.error("Failed to fetch profiles:", err);
          const fallbackMap = new Map();
          otherMembers.forEach((id: number) =>
            fallbackMap.set(id, { name: `User ${id}` })
          );
          setUserProfilesMap(fallbackMap);
        }
      } catch (err) {
        console.error("Failed to fetch room info:", err);
      }
    };

    fetchRoomAndProfiles();
  }, [roomId, currentUserId]);

  // Monitor call status
  useEffect(() => {
    if (!outgoingCallId) return;

    const unsub = onSnapshot(doc(db, "calls", outgoingCallId), (snap) => {
      const data = snap.data();
      if (!data) return;

      setCallStatus(data.status);

      if (data.status === "rejected" || data.status === "ended") {
        setOutgoingCallId(null);
        setCallStatus(null);
      }
    });

    return () => unsub();
  }, [outgoingCallId, setOutgoingCallId]);

  const handleCallClick = async () => {
    if (!roomId || roomMembers.length === 0) {
      toast.error(t("cannotStartCall") || "Không thể bắt đầu cuộc gọi");
      return;
    }

    try {
      const callDoc = await addDoc(collection(db, "calls"), {
        senderId: currentUserId,
        receiverIds: roomMembers,
        status: "ringing",
        createdAt: new Date(),
        offer: null,
      });

      setOutgoingCallReceiver(roomId);
      setOutgoingCallId(callDoc.id);

      toast.info(t("callingUser") || "Đang gọi...");
    } catch (err) {
      console.error("Failed to start call:", err);
      toast.error(t("callFailed") || "Không thể thực hiện cuộc gọi");
    }
  };

  const loadInitialMessages = async () => {
    if (initialLoaded || loadingMore) return;

    try {
      const data = await chatService.getRoomMessages(roomId, 1, PAGE_SIZE);
      const reversed = data.reverse();
      setMessages(reversed);
      setPage(1);
      setHasMore(data.length === PAGE_SIZE);
      setInitialLoaded(true);
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error("Failed to load initial messages:", error);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const container = containerRef.current;
    if (container) {
      previousScrollHeight.current = container.scrollHeight;
      previousScrollTop.current = container.scrollTop;
    }

    try {
      const nextPage = page + 1;
      const data = await chatService.getRoomMessages(
        roomId,
        nextPage,
        PAGE_SIZE
      );

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }

      if (data.length > 0) {
        const olderMessages = data.reverse();
        setMessages((prev) => [...olderMessages, ...prev]);
        setPage(nextPage);

        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const heightDiff = newScrollHeight - previousScrollHeight.current;
            container.scrollTop = previousScrollTop.current + heightDiff;
          }
        });
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !topSentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreMessages();
        }
      },
      {
        root: container,
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    observer.observe(topSentinelRef.current);

    return () => observer.disconnect();
  }, [roomId, hasMore, loadingMore]);

  useEffect(() => {
    if (!isMinimized && roomId && !initialLoaded) {
      loadInitialMessages();

      if (chatSocket) {
        chatSocket.socket.emit("joinRoom", {
          roomId,
          userId: currentUserId,
        });
      }
    }
  }, [roomId, isMinimized, initialLoaded, chatSocket]);

  useEffect(() => {
    if (!chatSocket) return;

    const s = chatSocket.socket;

    const handleNewMessage = (msg: Message) => {
      if (msg.roomId === roomIdRef.current) {
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === msg.id);
          if (exists) return prev;
          return [...prev, msg];
        });

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

  const scrollToBottom = (force = false) => {
    const container = containerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      150;

    if (force || isNearBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

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

      if (attachments.length === 1) {
        const uploaded = await uploadLocalSingle(attachments[0]);
        fileUrl = uploaded;
      } else if (attachments.length > 1) {
        const uploadedUrls = await uploadLocalMultiple(attachments);
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

      chatSocket.sendMessage(payload);

      setNewMsg("");
      setAttachments([]);
      setReplyingMessage(null);

      setTimeout(() => scrollToBottom(true), 100);
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

  const handleExpand = () => {
    const locale = pathname.split("/")[1] || "en";
    const targetUrl = `/${locale}/chat?tab=personal&roomId=${roomId}`;
    router.push(targetUrl);
    onClose();
  };

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

  const renderAvatar = () => {
    if (roomAvatar) {
      return (
        <img
          src={resolveFileUrl(roomAvatar)}
          alt={roomName}
          className="w-8 h-8 rounded-full object-cover"
        />
      );
    }
    const initial = roomName?.charAt(0)?.toUpperCase() || "?";
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white font-semibold">
        {initial}
      </div>
    );
  };

  return (
    <div
      className={`bg-white shadow-2xl rounded-t-lg border border-gray-300 flex flex-col transition-all duration-300 z-[9999]`}
      style={{
        width: "350px",
        height: isMinimized ? "50px" : "500px",
      }}
    >
      <div className="flex items-center justify-between p-3 bg-green-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          {renderAvatar()}
          <span className="font-semibold truncate max-w-[140px]">
            {roomName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCallClick}
            disabled={isRinging || roomMembers.length === 0}
            className={`p-1.5 rounded transition ${
              isRinging ? "bg-red-500 animate-pulse" : "hover:bg-green-700"
            }`}
          >
            <FaVideo size={14} />
          </button>

          <button
            onClick={handleExpand}
            className="hover:bg-green-700 p-1.5 rounded"
          >
            <FaExpand size={14} />
          </button>
          <button
            onClick={onMinimize}
            className="hover:bg-green-700 p-1.5 rounded"
          >
            <FaMinus size={14} />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-green-700 p-1.5 rounded"
          >
            <FaTimes size={14} />
          </button>
        </div>
      </div>

      {isRinging && (
        <div className="bg-yellow-100 border-b border-yellow-300 px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
            <span className="text-xs text-yellow-800 font-medium">
              {t("callingUser")}
            </span>
          </div>
          <button
            onClick={() => {
              setOutgoingCallId(null);
              setCallStatus(null);
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            {t("cancel")}
          </button>
        </div>
      )}

      {!isMinimized && (
        <>
          <div
            ref={containerRef}
            className="flex-1 p-3 space-y-2 bg-gray-50 overflow-y-auto flex flex-col"
          >
            <div className="flex justify-center py-6">
              <div ref={topSentinelRef} className="w-full h-12">
                {loadingMore && (
                  <div className="flex justify-center items-center">
                    <Spinner className="w-8 h-8 border-green-600" />
                  </div>
                )}
              </div>
            </div>

            {messages.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 text-sm flex-1 flex items-center justify-center">
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
                  currentUserId={currentUserId}
                  userProfilesMap={userProfilesMap}
                />
              ))
            )}
            <div ref={messageEndRef} />
          </div>

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
              className="h-8 bg-green-600 hover:bg-green-700"
            >
              {uploading ? "..." : t("send")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
