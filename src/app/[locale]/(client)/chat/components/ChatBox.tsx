"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/services/chatService";
import { FaPaperclip, FaPaperPlane, FaEdit, FaTrash } from "react-icons/fa";

export default function ChatBox({
  selfUserId,
  messages,
  onSendText,
  onSendFiles,
  onEditMessage,
  onDeleteMessage,
}: {
  selfUserId: number;
  messages: ChatMessage[];
  onSendText: (text: string) => void;
  onSendFiles: (files: File[], caption?: string) => void;
  onEditMessage?: (messageId: number, newContent: string) => void;
  onDeleteMessage?: (messageId: number) => void;
}) {
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

  const triggerPick = () => fileInputRef.current?.click();

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...fl]);
    e.target.value = "";
  };

  const clearFiles = () => setFiles([]);

  const send = () => {
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
    <div
      className="max-w-[680px]"
      onClick={() => setContextMsgId(null)} // click ngoài để đóng menu
    >
      {/* Message list */}
      <div className="flex h-[420px] flex-col-reverse overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
        {messages.map((m) => {
          const mine = m.senderId === selfUserId;
          return (
            <div
              key={m.id}
              className={`relative p-2 ${mine ? "text-right" : "text-left"}`}
              onContextMenu={(e) => {
                e.preventDefault();
                if (mine && !m.deleted) setContextMsgId(m.id);
              }}
            >
              <div
                className={`inline-block max-w-[520px] rounded-lg px-3 py-2 shadow-sm ${
                  mine ? "bg-green-100" : "bg-gray-200"
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
                  <div
                    className={`mt-1 text-xs text-gray-500 ${
                      mine ? "text-right" : "text-left"
                    }`}
                  >
                    {formatTime(m.createdAt)}{" "}
                    {m.edited && <span>(edited)</span>}
                  </div>
                )}
              </div>

              {/* Actions (only on right-click) */}
              {mine && !m.deleted && contextMsgId === m.id && (
                <div className="absolute right-0 top-0 flex items-center gap-3 rounded-md bg-white px-2 py-1 shadow-md">
                  {m.type === "TEXT" && onEditMessage && (
                    <button
                      onClick={() => {
                        const val = prompt("Edit message", m.content ?? "");
                        if (val && val.trim()) onEditMessage(m.id, val.trim());
                        setContextMsgId(null);
                      }}
                      title="Edit"
                      className="text-green-600 transition-colors hover:text-green-700"
                    >
                      <FaEdit />
                    </button>
                  )}
                  {onDeleteMessage && (
                    <button
                      onClick={() => {
                        onDeleteMessage(m.id);
                        setContextMsgId(null);
                      }}
                      title="Delete"
                      className="text-red-500 transition-colors hover:text-red-600"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              )}
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
        />

        <button
          onClick={triggerPick}
          title="Attach files"
          className="text-gray-600 transition-colors hover:text-gray-800"
        >
          <FaPaperclip size={18} />
        </button>

        {hasFiles && (
          <div className="text-xs text-gray-700">
            {files.length} file(s)
            {allImages ? " (images)" : ""} selected
            <button
              onClick={clearFiles}
              className="ml-2 cursor-pointer text-blue-600 hover:underline"
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
          />
        ) : (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm outline-none focus:border-green-500"
          />
        )}

        <button
          onClick={send}
          title="Send"
          className="rounded-md bg-green-600 p-2 text-white transition-colors hover:bg-green-700"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}
