"use client";

import React, { createContext, useEffect, useState, useContext } from "react";
import { createChatSocket, type ChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/store/authStore";

type UnreadSummary = any;

type ChatContextValue = {
  socket: ChatSocket | null;
  isConnected: boolean;
  messages: any[]; // ✅ Export messages
  unreadSummary: UnreadSummary | null;
  unreadCount: number;
  sendMessage: (payload: any) => void;
  updateMessage: (messageId: number, content: string) => void;
  deleteMessage: (messageId: number) => void;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
};

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used inside <ChatProvider />");
  }
  return ctx;
}

export default function ChatProvider({
  children,
  conversationId,
}: {
  children: React.ReactNode;
  conversationId?: number;
}) {
  const { user } = useAuthStore();

  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadSummary, setUnreadSummary] = useState<UnreadSummary | null>(
    null
  );
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      setIsConnected(false);
      setMessages([]);
      setUnreadSummary(null);
      setUnreadCount(0);
      return;
    }

    const chatSocket = createChatSocket({
      xUser: { id: user.id, role: user.role, email: user.email },
      conversationId,
      debug: process.env.NODE_ENV === "development",
      onMessage: (msg) => {
        setMessages((prev) => [...prev, msg]);

        // ✅ Broadcast event cho ChatBoxManager
        if (msg.senderId !== user.id) {
          console.log("📢 Broadcasting new message event");
          const event = new CustomEvent("newChatMessage", { detail: msg });
          window.dispatchEvent(event);
        }
      },
      onUnreadSummary: (summary) => {
        setUnreadSummary(summary);
        const total = (summary && (summary.count ?? summary.count ?? 0)) || 0;
        setUnreadCount(total);
      },
      onConnected: () => {
        setIsConnected(true);
      },
    });

    setSocket(chatSocket);
    setIsConnected(chatSocket.isConnected());

    return () => {
      setIsConnected(false);
      chatSocket.socket.disconnect();
    };
  }, [user, conversationId]);

  const value: ChatContextValue = {
    socket,
    isConnected,
    messages, // ✅ Export
    unreadSummary,
    unreadCount,
    sendMessage: (payload: any) => {
      socket?.sendMessage(payload);
    },
    updateMessage: (messageId: number, content: string) => {
      socket?.updateMessage(messageId, content);
    },
    deleteMessage: (messageId: number) => {
      socket?.deleteMessage(messageId);
    },
    setMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
