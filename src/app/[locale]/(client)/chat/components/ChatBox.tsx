"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/services/chatService";
import { FaPaperclip, FaPaperPlane, FaEdit, FaTrash } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import DefaultAvatar from "@/app/layout/default/DefaultAvatar";

export default function ChatBox({
  selfUserId,
  messages,
  onSendText,
  onSendFiles,
  onEditMessage,
  onDeleteMessage,
  isUploading = false, // NEW
}: {
  selfUserId: number;
  messages: ChatMessage[];
  onSendText: (text: string) => void;
  onSendFiles: (files: File[], caption?: string) => void;
  onEditMessage?: (messageId: number, newContent: string) => void;
  onDeleteMessage?: (messageId: number) => void;
  isUploading?: boolean; // NEW
}) {
  const { user } = useAuthStore(); // id, fullName, avatarUrl
  const [otherUser, setOtherUser] = useState<{
    id: number;
    fullName: string;
    avatarUrl?: string;
  } | null>(null);
  const [text, setText] = useState("");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [contextMsgId, setContextMsgId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFiles = files.length > 0;
  const allImages = useMemo(
    () => files.length > 0 && files.every((f) => f.type?.startsWith("image/")),
    [files]
  );

  const triggerPick = () => !isUploading && fileInputRef.current?.click(); // disable khi uploading

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return;
    const fl = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...fl]);
    e.target.value = "";
  };

  const clearFiles = () => !isUploading && setFiles([]);

  const send = () => {
    if (isUploading) return;
    if (hasFiles) {
      onSendFiles(files, caption || undefined);
      setCaption("");
      setFiles([]);
      setContextMsgId(null);
      return;
    }
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
    setContextMsgId(null);
  };

  useEffect(() => {
    console.log("DEBUG - selfUserId:", selfUserId);
    console.log("DEBUG - first messages:", messages.slice(0, 3));
  }, [selfUserId, messages]);

  useEffect(() => {
    const fetchOtherUser = async () => {
      const firstMsg = messages.find((m) => m.senderId !== selfUserId);
      if (!firstMsg) return;
      try {
        const res = await userService.getBasicProfile(firstMsg.senderId);
        setOtherUser(res.data); // hoặc res.data.data nếu backend gói trong AppApiResponse
      } catch (err) {
        console.error("Failed to load other user", err);
      }
    };
    fetchOtherUser();
  }, [messages, selfUserId]);

  const formatTime = (time?: string | Date) => {
    if (!time) return "";
    const d = new Date(time);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderAttachments = (m: ChatMessage) => {
    if (!m.attachments?.length) return null;
    return (
      <div className="mt-1.5 flex flex-wrap gap-2">
        {m.attachments.map((a) =>
          a.mimeType?.startsWith("image/") ? (
            <img
              key={a.id ?? a.url}
              src={a.url}
              alt={a.fileName ?? "image"}
              className="max-w-[200px] rounded-md shadow-sm"
            />
          ) : (
            <a
              key={a.id ?? a.url}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline"
            >
              {a.fileName ?? a.url}
            </a>
          )
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full" onClick={() => setContextMsgId(null)}>
      {/* Message list */}
      <div className="flex min-h-[60vh] max-h-[76vh] flex-col-reverse overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
        {messages.map((m) => {
          const mine = m.senderId === selfUserId;
          const avatarUrl = mine ? user?.avatarUrl : otherUser?.avatarUrl;

          return (
            <div
              key={m.id}
              className={`relative flex items-start gap-2 p-2 ${
                mine ? "justify-end" : "justify-start"
              }`}
              onContextMenu={(e) => {
                e.preventDefault();
                if (mine && !m.deleted) setContextMsgId(m.id);
              }}
            >
              {!mine &&
                (avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <DefaultAvatar
                    firstName={otherUser?.fullName?.split(" ")[0]}
                  />
                ))}

              <div
                className={`inline-block max-w-[520px] rounded-lg px-3 py-2 shadow-sm ${
                  mine ? "bg-green-100 text-right" : "bg-gray-200 text-left"
                }`}
              >
                {m.deleted ? (
                  <i className="text-sm text-gray-500">Message deleted</i>
                ) : (
                  <>
                    {m.content && <div>{m.content}</div>}
                    {renderAttachments(m)}
                  </>
                )}
                {!m.deleted && (
                  <div className="mt-1 text-xs text-gray-500">
                    {formatTime(m.createdAt)}{" "}
                    {m.edited && <span>(edited)</span>}
                  </div>
                )}
              </div>

              {mine &&
                (user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <DefaultAvatar
                    firstName={user?.fullName?.split(" ")[0]}
                  />
                ))}
            </div>
          );
        })}
      </div>

      {/* Input zone */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={onPickFiles}
          disabled={isUploading}
        />

        <button
          onClick={triggerPick}
          title="Attach files"
          className={`text-gray-600 transition-colors hover:text-gray-800 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isUploading}
        >
          <FaPaperclip size={18} />
        </button>

        {hasFiles && (
          <div className="text-xs text-gray-700">
            {files.length} file(s){allImages ? " (images)" : ""} selected
            <button
              onClick={clearFiles}
              className={`ml-2 cursor-pointer text-blue-600 hover:underline ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUploading}
            >
              Clear
            </button>
          </div>
        )}

        {hasFiles ? (
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-500"
            disabled={isUploading}
          />
        ) : (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => !isUploading && e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-500"
            disabled={isUploading}
          />
        )}

        <button
          onClick={send}
          title="Send"
          className={`rounded-md bg-green-600 p-2 text-white transition-colors hover:bg-green-700 ${
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isUploading}
        >
          {!isUploading && <FaPaperPlane />}
        </button>

        {isUploading && (
          <div className="ml-2 flex items-center gap-2 text-sm text-gray-600">
            <span>Uploading...</span>
          </div>
        )}
      </div>
    </div>
  );
}
