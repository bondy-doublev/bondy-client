"use client";

import { useMemo, useRef, useState } from "react";
import type { ChatMessage } from "@/services/chatService";

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
    // reset input để chọn lại được cùng file lần nữa
    e.target.value = "";
  };

  const clearFiles = () => setFiles([]);

  const send = () => {
    if (hasFiles) {
      onSendFiles(files, caption || undefined);
      setCaption("");
      setFiles([]);
      return;
    }
    if (!text.trim()) return;
    onSendText(text.trim());
    setText("");
  };

  const renderAttachments = (m: ChatMessage) => {
    if (!m.attachments?.length) return null;
    return (
      <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {m.attachments.map((a) =>
          a.mimeType?.startsWith("image/") ? (
            <img
              key={a.id ?? a.url}
              src={a.url}
              alt={a.fileName ?? "image"}
              style={{ maxWidth: 200, borderRadius: 6 }}
            />
          ) : (
            <a
              key={a.id ?? a.url}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              {a.fileName ?? a.url}
            </a>
          )
        )}
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <div
        style={{
          border: "1px solid #e5e7eb",
          height: 420,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
          padding: 8,
        }}
      >
        {messages.map((m) => {
          const mine = m.senderId === selfUserId;
          return (
            <div
              key={m.id}
              style={{
                padding: 8,
                textAlign: mine ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background: mine ? "#d1ffd6" : "#eee",
                  borderRadius: 8,
                  padding: "6px 10px",
                  maxWidth: 520,
                }}
              >
                {/* Nội dung */}
                {m.deleted ? (
                  <i style={{ color: "#6b7280" }}>Message deleted</i>
                ) : (
                  <>
                    {m.content && <div>{m.content}</div>}
                    {renderAttachments(m)}
                  </>
                )}
                {/* Badge edited */}
                {m.edited && !m.deleted && (
                  <div style={{ marginTop: 4, fontSize: 12, color: "#6b7280" }}>
                    edited
                  </div>
                )}
              </div>
              {/* Action cho tin của chính mình */}
              {mine && !m.deleted && (
                <div style={{ marginTop: 4, display: "inline-flex", gap: 8 }}>
                  {m.type === "TEXT" && onEditMessage && (
                    <button
                      onClick={() => {
                        const val = prompt("Edit message", m.content ?? "");
                        if (val && val.trim()) onEditMessage(m.id, val.trim());
                      }}
                      style={{ fontSize: 12 }}
                    >
                      Edit
                    </button>
                  )}
                  {onDeleteMessage && (
                    <button
                      onClick={() => onDeleteMessage(m.id)}
                      style={{ fontSize: 12, color: "#b91c1c" }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}
      >
        {/* Files control */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={onPickFiles}
        />
        <button onClick={triggerPick}>Attach</button>
        {hasFiles && (
          <div style={{ fontSize: 12, color: "#374151" }}>
            {files.length} file(s){allImages ? " (images)" : ""} selected
            <button
              onClick={clearFiles}
              style={{ marginLeft: 8, fontSize: 12 }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Caption cho ảnh/file */}
        {hasFiles && (
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            style={{ flex: 1 }}
          />
        )}

        {/* Text box */}
        {!hasFiles && (
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            style={{ flex: 1 }}
          />
        )}
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
