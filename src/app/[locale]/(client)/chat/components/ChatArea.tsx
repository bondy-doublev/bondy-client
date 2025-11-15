"use client";
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "./ChatMessage";
import { Message } from "@/services/chatService";
import { FaPaperclip } from "react-icons/fa";

interface ChatAreaProps {
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
}

export const ChatArea: React.FC<ChatAreaProps> = ({
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
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setAttachments(Array.from(e.target.files));
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
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

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Dùng div thông thường thay vì ScrollArea */}
      <div
        ref={messageContainerRef}
        className="flex-1 p-4 space-y-2 bg-gray-50 overflow-y-auto"
        style={{
          scrollBehavior: "auto",
        }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-80">
            Chưa có tin nhắn nào
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
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

      <div className="p-4 border-t border-gray-200 flex items-center space-x-2 bg-white">
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
        />

        <Button onClick={handleSendClick} disabled={uploading}>
          {uploading && (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          )}
          Send
        </Button>
      </div>
    </div>
  );
};
