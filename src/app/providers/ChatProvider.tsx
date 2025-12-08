"use client";

import React, { createContext, useEffect, useState, useContext } from "react";
import { createChatSocket, type ChatSocket } from "@/lib/chatSocket";
import { useAuthStore } from "@/store/authStore";

type UnreadSummary = any;

type ChatContextValue = {
  socket: ChatSocket | null;
  isConnected: boolean;
  messages: any[];
  unreadSummary: UnreadSummary | null;
  unreadCount: number; // tổng unread cho badge
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
    // chưa login thì không connect
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
      },
      onUnreadSummary: (summary) => {
        setUnreadSummary(summary);

        // Tùy backend: nếu summary có total / totalUnread thì dùng;
        // nếu không, bạn có thể sửa lại logic này hoặc fetch REST giống code cũ.
        const total = (summary && (summary.count ?? summary.count ?? 0)) || 0;
        setUnreadCount(total);
      },
      onConnected: () => {
        setIsConnected(true);
      },
    });

    // socket.io connect ngay khi createChatSocket được gọi
    setSocket(chatSocket);
    setIsConnected(chatSocket.isConnected());

    return () => {
      setIsConnected(false);
      // ngắt kết nối khi unmount
      chatSocket.socket.disconnect();
    };
  }, [user, conversationId]);

  const value: ChatContextValue = {
    socket,
    isConnected,
    messages,
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
