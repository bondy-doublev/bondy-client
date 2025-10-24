"use client";

import { useEffect, useRef, useState } from "react";
import {
  Attachment,
  ChatMessage,
  SendMessagePayload,
  chatService,
} from "@/services/chatService";
import { ChatSocket, createChatSocket } from "@/lib/chatSocket";

export function useChat(params: {
  conversationId: number | null;
  xUser: { id: number; role?: string; email?: string };
  initialMessages?: ChatMessage[];
  uploadFiles?: (files: File[]) => Promise<Attachment[]>;
}) {
  const { conversationId, xUser, initialMessages = [], uploadFiles } = params;
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isUploading, setIsUploading] = useState(false); // NEW
  const socketRef = useRef<ChatSocket | null>(null);
  const lastConvIdRef = useRef<number | null>(null);
  const syncedRef = useRef(false);

  // Timer debounce cho reload
  const refreshTimerRef = useRef<number | null>(null);
  const clearRefreshTimer = () => {
    if (refreshTimerRef.current != null) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };
  const scheduleRefresh = (delay = 250) => {
    clearRefreshTimer();
    refreshTimerRef.current = window.setTimeout(async () => {
      if (!conversationId) return;
      try {
        const data = await chatService.getHistory(conversationId, 0, 20);
        setMessages(data);
      } finally {
        refreshTimerRef.current = null;
      }
    }, delay);
  };

  const upsertMessage = (m: ChatMessage) => {
    setMessages((prev) => {
      const idx = prev.findIndex((x) => x.id === m.id);
      if (idx >= 0) {
        const clone = prev.slice();
        clone[idx] = m;
        return clone;
      }
      return [m, ...prev];
    });
  };

  const optimisticEdit = (messageId: number, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: newContent,
              edited: true,
              editedAt: new Date().toISOString(),
            }
          : m
      )
    );
  };

  const optimisticDelete = (messageId: number) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? {
              ...m,
              deleted: true,
              deletedAt: new Date().toISOString(),
              content: null,
            }
          : m
      )
    );
  };

  useEffect(() => {
    if (conversationId && conversationId !== lastConvIdRef.current) {
      lastConvIdRef.current = conversationId;
      setMessages(initialMessages);
      syncedRef.current = false;
      clearRefreshTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const s = createChatSocket({
      conversationId,
      xUser,
      onMessage: (msg) => {
        upsertMessage(msg);
        scheduleRefresh();
      },
      onConnected: async () => {
        if (!syncedRef.current) {
          const data = await chatService.getHistory(conversationId, 0, 20);
          setMessages(data);
          syncedRef.current = true;
        }
      },
    });
    socketRef.current = s;
    s.client.activate();

    return () => {
      clearRefreshTimer();
      s.client.deactivate();
      socketRef.current = null;
    };
  }, [conversationId, xUser.id, xUser.role, xUser.email]);

  const sendPayload = async (payload: SendMessagePayload) => {
    if (socketRef.current?.isConnected()) {
      socketRef.current.sendMessage(payload);
    } else {
      const saved = await chatService.sendMessage(payload);
      upsertMessage(saved);
      scheduleRefresh();
    }
  };

  const sendText = async (text: string) => {
    const content = text.trim();
    if (!content || !conversationId) return;
    await sendPayload({ conversationId, type: "TEXT", content });
  };

  const sendWithFiles = async (files: File[], caption?: string) => {
    if (!files?.length || !conversationId) return;
    if (!uploadFiles) throw new Error("uploadFiles is not provided");
    setIsUploading(true); // NEW start
    try {
      const attachments = await uploadFiles(files);
      const allImages = files.every((f) => f.type?.startsWith("image/"));
      const type = allImages ? "IMAGE" : "FILE";
      await sendPayload({
        conversationId,
        type,
        content: caption ?? null,
        attachments,
      });
    } finally {
      setIsUploading(false); // NEW end
    }
  };

  const editMessage = async (messageId: number, newContent: string) => {
    if (socketRef.current?.isConnected()) {
      optimisticEdit(messageId, newContent);
      socketRef.current.updateMessage(messageId, newContent);
      scheduleRefresh();
    } else {
      const updated = await chatService.editMessage(messageId, newContent);
      upsertMessage(updated);
      scheduleRefresh();
    }
  };

  const deleteMessage = async (messageId: number) => {
    if (socketRef.current?.isConnected()) {
      optimisticDelete(messageId);
      socketRef.current.deleteMessage(messageId);
      scheduleRefresh();
    } else {
      const updated = await chatService.deleteMessage(messageId);
      upsertMessage(updated);
      scheduleRefresh();
    }
  };

  const reloadHistory = async (page = 0, size = 20) => {
    if (!conversationId) return;
    const data = await chatService.getHistory(conversationId, page, size);
    setMessages(data);
  };

  return {
    messages,
    sendText,
    sendWithFiles,
    editMessage,
    deleteMessage,
    reloadHistory,
    isConnected: socketRef.current?.isConnected() ?? false,
    isUploading, // NEW
  };
}
