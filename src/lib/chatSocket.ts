// src/lib/chatSocket.ts
import { io, Socket } from "socket.io-client";

const CHAT_URL = process.env.NEXT_PUBLIC_CHAT_URL || "http://localhost:8086";

export type ChatSocket = {
  socket: Socket;
  isConnected: () => boolean;
  sendMessage: (payload: any) => void;
  updateMessage: (messageId: number, content: string) => void;
  deleteMessage: (messageId: number) => void;
  updateHeadersAndReconnect: (headers: Record<string, string>) => Promise<void>;
};

export function createChatSocket(opts: {
  conversationId?: number;
  onMessage?: (msg: any) => void;
  onUnreadSummary?: (summary: any) => void; // { roomId, count } từ BE
  onConnected?: () => void;
  xUser: { id: number; role?: string; email?: string };
  debug?: boolean;
}): ChatSocket {
  const socket = io(CHAT_URL, {
    transports: ["websocket"],
    auth: {
      "X-User-Id": String(opts.xUser.id),
      ...(opts.xUser.role ? { "X-User-Role": opts.xUser.role } : {}),
      ...(opts.xUser.email ? { "X-Email": opts.xUser.email } : {}),
    },
  });

  if (opts.debug) {
    socket.onAny((event, ...args) => {
      console.log("[SOCKET][EVENT]", event, args);
    });
  }

  socket.on("connect", () => {
    console.log("[WS] Connected as", opts.xUser.id);

    // Join room cá nhân để nhận badge
    socket.emit("joinRoom", {
      roomId: String(opts.xUser.id),
      userId: opts.xUser.id,
    });

    // Join room hội thoại cụ thể (nếu có)
    if (opts.conversationId) {
      socket.emit("joinRoom", {
        roomId: String(opts.conversationId),
        userId: opts.xUser.id,
      });
    }

    opts.onConnected?.();
  });

  socket.on("connect_error", (err) => {
    console.error("[WS] connect_error:", err);
  });

  socket.on("error", (err) => {
    console.error("[WS] error:", err);
  });

  // Nhận tin nhắn mới từ gateway: this.server.to(roomId).emit('newMessage', msg);
  socket.on("newMessage", (msg: any) => {
    opts.onMessage?.(msg);
  });

  // Nhận cập nhật badge: this.server.to(userId).emit('updateUnreadBadge', { roomId, count });
  socket.on("updateUnreadBadge", (summary: any) => {
    opts.onUnreadSummary?.(summary);
  });

  const sendMessage = (payload: any) => {
    // Map với @SubscribeMessage('sendMessage')
    socket.emit("sendMessage", payload);
  };

  const updateMessage = (messageId: number, content: string) => {
    socket.emit("editMessage", {
      id: messageId,
      userId: opts.xUser.id,
      content,
    });
  };

  const deleteMessage = (messageId: number) => {
    socket.emit("deleteMessage", {
      id: messageId,
      userId: opts.xUser.id,
    });
  };

  const updateHeadersAndReconnect = async (headers: Record<string, string>) => {
    // Cập nhật auth rồi reconnect
    socket.disconnect();
    socket.auth = {
      ...(socket.auth || {}),
      ...headers,
    };
    socket.connect();
  };

  return {
    socket,
    isConnected: () => socket.connected,
    sendMessage,
    updateMessage,
    deleteMessage,
    updateHeadersAndReconnect,
  };
}
