"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { chatService, Message } from "@/services/chatService";
import { FaEllipsisV, FaPaperclip, FaVideo } from "react-icons/fa";
import VideoCallModal from "./VideoCallModal";
import { v4 as uuid } from "uuid";
import {
  onSnapshot,
  collection,
  query,
  where,
  addDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/configs/firebase";
import { useRingtone } from "@/app/hooks/useRingTone";
import { ChatRightPanel } from "./ChatRightPanel";
import { useCall } from "@/context/CallContext";

interface ChatAreaProps {
  isGroup: boolean;
  selectedRoom: string | null;
  currentUserId: number;
  messages: Message[];
  newMsg: string;
  setNewMsg: (msg: string) => void;
  onSend: () => Promise<void>;
  messageEndRef: React.RefObject<HTMLDivElement>;
  messageContainerRef: React.RefObject<HTMLDivElement>;
  attachments: File[];
  setAttachments: (files: File[]) => void;
  onEditMessage: (msg: Message, newContent: string) => void;
  onDeleteMessage: (msg: Message) => void;
  onReplyMessage: (msg: Message) => void;
  replyingMessage: Message | null;
  onRoomUpdated: () => void;
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
}) => {
  const [uploading, setUploading] = useState(false);
  const { setOutgoingCallId, outgoingCallId, setOutgoingCallReceiver } =
    useCall();
  const [roomMembers, setRoomMembers] = useState<number[]>([]);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

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

  useEffect(() => {
    if (!selectedRoom) return;

    const fetchMembers = async () => {
      try {
        const room = await chatService.getRoomInformation(selectedRoom);

        // Loại bỏ chính user
        const otherMembers = room.members
          .map((m) => m.userId) // dùng userId
          .filter((id) => id !== currentUserId);

        setRoomMembers(otherMembers);
      } catch (err) {
        console.error("Failed to fetch room members:", err);
      }
    };

    fetchMembers();
  }, [selectedRoom, currentUserId]);

  useEffect(() => {
    if (!outgoingCallId) return;
    const unsub = onSnapshot(doc(db, "calls", outgoingCallId), (snap) => {
      const data = snap.data();
      if (!data) return;

      setCallStatus(data.status); // cập nhật status

      if (data.status === "rejected" || data.status === "ended") {
        setOutgoingCallId(null);
      }
    });
    return () => unsub();
  }, [outgoingCallId]);

  return (
    <div className="flex-1 flex flex-col h-full relative">
      <ChatRightPanel
        isGroup={isGroup}
        selectedRoom={selectedRoom}
        open={isRightPanelOpen}
        onOpenChange={setIsRightPanelOpen}
        onRoomUpdated={onRoomUpdated}
      />

      <div className="w-full p-2 md:p-3 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 mr-2 rounded hover:bg-gray-100"
          onClick={() => {
            const event = new CustomEvent("openSidebar");
            window.dispatchEvent(event);
          }}
        >
          ☰
        </button>

        <div className="font-semibold text-gray-700">Chat</div>

        <div className="flex items-center gap-4">
          {/* Video Call */}
          <button
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
            onClick={handleCallClick}
          >
            <FaVideo size={20} />
          </button>

          {/* Menu */}
          <FaEllipsisV
            size={20}
            className="cursor-pointer"
            onClick={() => setIsRightPanelOpen(true)}
          />
        </div>
      </div>

      <div
        ref={messageContainerRef}
        className="flex-1 p-2 md:p-4 space-y-2 bg-gray-50 overflow-y-auto"
        style={{
          scrollBehavior: "auto",
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-80">
            Chưa có tin nhắn nào
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              msg={msg}
              replyMessage={messages.find((x) => x.id === msg.replyToMessageId)}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
              onReply={onReplyMessage}
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
            Replying to: {replyingMessage.content || "[Attachment]"}
          </div>
        )}

        {/* Input area */}
        <div className="p-2 md:p-4 border-t border-gray-200 flex items-center space-x-2 bg-white sticky bottom-0 z-20">
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
            placeholder="Type a message..."
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
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
