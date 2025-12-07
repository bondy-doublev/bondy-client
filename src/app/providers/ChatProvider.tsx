// src/app/providers/ChatProvider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { createChatSocket, type ChatSocket } from "@/lib/chatSocket";
import type { ChatMessage, SendMessagePayload } from "@/services/chatService";

type UnreadSummary = any;

type ChatContextValue = {
  socket: ChatSocket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  unreadSummary: UnreadSummary | null;
  sendMessage: (payload: SendMessagePayload) => void;
  updateMessage: (messageId: number, content: string) => void;
  deleteMessage: (messageId: number) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider />");
  return ctx;
}

interface ChatProviderProps {
  children: ReactNode;
  xUser: { id: number; role?: string; email?: string };
  conversationId?: number; // có thể để undefined ở root
  debug?: boolean;
}

export function ChatProvider({
  children,
  xUser,
  conversationId,
  debug,
}: ChatProviderProps) {
  const [socket, setSocket] = useState<ChatSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadSummary, setUnreadSummary] = useState<UnreadSummary | null>(
    null
  );

  useEffect(() => {
    const chatSocket = createChatSocket({
      xUser,
      conversationId,
      debug,
      onMessage: (msg) => {
        setMessages((prev) => [...prev, msg]);
      },
      onUnreadSummary: (summary) => {
        setUnreadSummary(summary);
      },
      onConnected: () => {
        setIsConnected(true);
      },
    });

    chatSocket.client.activate();
    setSocket(chatSocket);

    return () => {
      setIsConnected(false);
      chatSocket.client.deactivate();
    };
  }, [xUser.id, xUser.role, xUser.email, conversationId, debug]);

  const value: ChatContextValue = useMemo(
    () => ({
      socket,
      isConnected,
      messages,
      unreadSummary,
      sendMessage: (payload: SendMessagePayload) => {
        socket?.sendMessage(payload);
      },
      updateMessage: (messageId: number, content: string) => {
        socket?.updateMessage(messageId, content);
      },
      deleteMessage: (messageId: number) => {
        socket?.deleteMessage(messageId);
      },
      setMessages,
    }),
    [socket, isConnected, messages, unreadSummary]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
