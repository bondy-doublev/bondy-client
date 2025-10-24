"use client";

import { ChatMessage } from "@/services/chatService";
import { useState } from "react";

export default function ChatBox({
  selfUserId,
  messages,
  onSend,
}: {
  selfUserId: number;
  messages: ChatMessage[];
  onSend: (text: string) => void;
}) {
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <div
        style={{
          border: "1px solid #e5e7eb",
          height: 380,
          overflow: "auto",
          display: "flex",
          flexDirection: "column-reverse",
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              padding: 8,
              textAlign: m.senderId === selfUserId ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: m.senderId === selfUserId ? "#d1ffd6" : "#eee",
                borderRadius: 8,
                padding: "6px 10px",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}
