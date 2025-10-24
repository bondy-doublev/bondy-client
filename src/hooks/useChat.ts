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

  // Upsert 1 message theo id (giữ UI mượt mà ngay khi nhận WS)
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

  // Optimistic edit
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

  // Optimistic delete
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
        // Cập nhật tức thì từ WS
        upsertMessage(msg);

        // Trigger reload API để đồng bộ chắc chắn (tránh miss sự kiện)
        // Nếu muốn giảm tải, chỉ reload khi sự kiện không phải của chính mình:
        // if (msg.senderId !== xUser.id) scheduleRefresh();
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
      // Sau khi gửi qua REST, cũng reload nhẹ để đồng bộ
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
    const attachments = await uploadFiles(files);
    const allImages = files.every((f) => f.type?.startsWith("image/"));
    const type = allImages ? "IMAGE" : "FILE";
    await sendPayload({
      conversationId,
      type,
      content: caption ?? null,
      attachments,
    });
  };

  const editMessage = async (messageId: number, newContent: string) => {
    if (socketRef.current?.isConnected()) {
      optimisticEdit(messageId, newContent);
      socketRef.current.updateMessage(messageId, newContent);
      scheduleRefresh(); // đảm bảo bên kia (và mình) đồng bộ lại
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
  };
}
