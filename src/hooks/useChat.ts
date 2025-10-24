"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage, chatService } from "@/services/chatService";
import { ChatSocket, createChatSocket } from "@/lib/chatSocket";

export function useChat(params: {
  conversationId: number | null;
  xUser: { id: number; role?: string; email?: string };
  initialMessages?: ChatMessage[];
}) {
  const { conversationId, xUser, initialMessages = [] } = params;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const socketRef = useRef<ChatSocket | null>(null);
  const lastConvIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (conversationId && conversationId !== lastConvIdRef.current) {
      lastConvIdRef.current = conversationId;
      setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const s = createChatSocket({
      conversationId,
      xUser,
      onMessage: (msg) => setMessages((prev) => [msg, ...prev]),
    });
    socketRef.current = s;
    s.client.activate();

    return () => {
      s.client.deactivate();
      socketRef.current = null;
    };
  }, [conversationId, xUser.id, xUser.role, xUser.email]);

  const send = (text: string) => {
    const content = text.trim();
    if (!content || !conversationId) return;
    socketRef.current?.sendMessage(conversationId, content);
  };

  const reloadHistory = async (page = 0, size = 20) => {
    if (!conversationId) return;
    const data = await chatService.getHistory(conversationId, page, size);
    setMessages(data);
  };

  return {
    messages,
    send,
    reloadHistory,
    isConnected: socketRef.current?.isConnected() ?? false,
  };
}
