"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { chatService, Message } from "@/services/chatService";
import { FaEllipsisV, FaPaperclip, FaVideo, FaBars } from "react-icons/fa";
import { useRingtone } from "@/app/hooks/useRingTone";
import { ChatRightPanel } from "./ChatRightPanel";
import { useCall } from "@/context/CallContext";
import { useTranslations } from "use-intl";
import { resolveFileUrl } from "@/utils/fileUrl";
import { userService } from "@/services/userService";
import { onSnapshot, collection, addDoc, doc } from "firebase/firestore";
import { db } from "@/configs/firebase";

interface ChatAreaProps {
  isGroup: boolean;
  selectedRoom: string | null;
  currentUserId: number;
  messages: Message[];
  newMsg: string;
  setNewMsg: (msg: string) => void;
  onSend: () => Promise<void>;
  messageEndRef: React.RefObject<HTMLDivElement> | null;
  messageContainerRef: React.RefObject<HTMLDivElement>;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  onEditMessage: (msg: Message, newContent: string) => void;
  onDeleteMessage: (msg: Message) => void;
  onReplyMessage: (msg: Message) => void;
  replyingMessage: Message | null;
  onRoomUpdated: () => void;
  onToggleSidebar?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  isGroup,
  selectedRoom,
  currentUserId,
  messages,
  newMsg,
  setNewMsg,
  onSend,
  messageEndRef,
  messageContainerRef,
  attachments,
  setAttachments,
  onEditMessage,
  onDeleteMessage,
  onReplyMessage,
  replyingMessage,
  onRoomUpdated,
  onToggleSidebar,
}) => {
  const [uploading, setUploading] = useState(false);
  const { setOutgoingCallId, outgoingCallId, setOutgoingCallReceiver } =
    useCall();
  const [roomMembers, setRoomMembers] = useState<number[]>([]);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const t = useTranslations("chat");

  const [userProfilesMap, setUserProfilesMap] = useState<
    Map<number, { name: string; avatarUrl?: string }>
  >(new Map());

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachments(Array.from(e.target.files));
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const isRinging = !!outgoingCallId && callStatus === "ringing";
  useRingtone(isRinging);

  const handleCallClick = async () => {
    if (!selectedRoom || roomMembers.length === 0) return;

    const callDoc = await addDoc(collection(db, "calls"), {
      senderId: currentUserId,
      receiverIds: roomMembers,
      status: "ringing",
      createdAt: new Date(),
      offer: null,
    });

    setOutgoingCallReceiver(selectedRoom);
    setOutgoingCallId(callDoc.id);
  };

  const handleSendClick = async () => {
    if (uploading) return;
    if (!newMsg.trim() && attachments.length === 0) return;

    setUploading(true);
    try {
      await onSend();
      setAttachments([]);
    } finally {
      setUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  // Fetch room members + batch fetch ALL profiles (including current user)
  useEffect(() => {
    if (!selectedRoom) {
      setRoomMembers([]);
      setUserProfilesMap(new Map());
      return;
    }

    const fetchRoomAndProfiles = async () => {
      try {
        const room = await chatService.getRoomInformation(selectedRoom);

        // Lấy TẤT CẢ userId trong room (bao gồm cả mình)
        const allMemberIds = room.members
          .map((m: any) => m.userId)
          .filter((id: number) => id != null); // phòng trường hợp null/undefined

        setRoomMembers(allMemberIds);

        console.log("All member IDs in room:", allMemberIds);

        if (allMemberIds.length === 0) {
          setUserProfilesMap(new Map());
          return;
        }

        try {
          const res = await userService.getBasicProfiles(allMemberIds);
          const profiles = res.data || res; // tùy format API của bạn

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

          // Fallback cho tất cả member IDs (đảm bảo không thiếu)
          allMemberIds.forEach((id: number) => {
            if (!newMap.has(id)) {
              newMap.set(id, { name: `User ${id}` });
            }
          });

          console.log("Final fixed profiles map:", Object.fromEntries(newMap));
          setUserProfilesMap(newMap);
        } catch (err) {
          console.error("Failed to batch fetch profiles:", err);
          // Fallback: tạo tên giả cho tất cả
          const fallbackMap = new Map<
            number,
            { name: string; avatarUrl?: string }
          >();
          allMemberIds.forEach((id: number) => {
            fallbackMap.set(id, { name: `User ${id}` });
          });
          setUserProfilesMap(fallbackMap);
        }
      } catch (err) {
        console.error("Failed to fetch room info:", err);
        setUserProfilesMap(new Map());
      }
    };

    fetchRoomAndProfiles();
  }, [selectedRoom]); // Không cần currentUserId ở dependency nữa vì lấy all members

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

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <ChatRightPanel
        isGroup={isGroup}
        selectedRoom={selectedRoom}
        open={isRightPanelOpen}
        onOpenChange={setIsRightPanelOpen}
        onRoomUpdated={onRoomUpdated}
      />

      <div className="w-full p-2 px-4 md:p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="lg:hidden">
          <button
            className="md:p-2 mr-2 rounded hover:bg-gray-100"
            onClick={() => onToggleSidebar?.()}
            aria-label="Toggle sidebar"
          >
            <FaBars size={18} />
          </button>
        </div>

        <div className="font-semibold text-gray-700">{t("chat")}</div>

        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            onClick={handleCallClick}
            disabled={isRinging || roomMembers.length === 0}
          >
            <FaVideo size={20} />
          </button>

          <FaEllipsisV
            size={20}
            className="cursor-pointer text-gray-600"
            onClick={() => setIsRightPanelOpen(true)}
          />
        </div>
      </div>

      <div
        ref={messageContainerRef}
        className="flex-1 p-2 md:p-4 space-y-2 bg-gray-50 overflow-y-auto"
        style={{ scrollBehavior: "auto" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-80">
            {t("noMessagesYet")}
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={msg.id || index}
              msg={msg}
              replyMessage={messages.find((x) => x.id === msg.replyToMessageId)}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onReply={onReplyMessage}
              currentUserId={currentUserId}
              userProfilesMap={userProfilesMap}
            />
          ))
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200">
        {attachments.length > 0 && (
          <div className="p-2 border-t border-gray-200 flex flex-wrap gap-2 bg-gray-100 max-h-32 overflow-y-auto">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="relative border rounded p-1 flex items-center gap-1 bg-white"
              >
                {file.type.startsWith("image") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <span className="text-xs max-w-[80px] truncate">
                    {file.name}
                  </span>
                )}
                <button
                  type="button"
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
                  onClick={() => removeAttachment(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {replyingMessage && (
          <div className="px-4 py-2 border-t border-gray-200 bg-gray-100 text-sm text-gray-600 italic">
            {t("replyingTo")}: {replyingMessage.content || t("attachment")}
          </div>
        )}

        <div className="p-2 md:p-4 border-t border-gray-200 flex items-center space-x-2 bg-white">
          <label className="cursor-pointer text-gray-600 hover:text-gray-800">
            <FaPaperclip size={20} />
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
            className="flex-1"
          />

          <Button onClick={handleSendClick} disabled={uploading}>
            {uploading && (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            )}
            {t("send")}
          </Button>
        </div>
      </div>
    </div>
  );
};
